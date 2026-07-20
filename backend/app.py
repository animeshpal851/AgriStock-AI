from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import time
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Load Models & Configuration
REPO_ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = REPO_ROOT / "models"
DATASET_PATH = REPO_ROOT / "dataset" / "processed" / "final_dataset.csv"

print("--- Loading Models & Pipeline ---")
try:
    regressor = joblib.load(MODEL_DIR / "best_model_regressor.pkl")
    classifier = joblib.load(MODEL_DIR / "best_model_classifier.pkl")
    label_encoders = joblib.load(MODEL_DIR / "label_encoders.pkl")
    pipeline_info = joblib.load(MODEL_DIR / "preprocessing_pipeline.pkl")
    print("Models and encoders loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    # Define fallbacks if models aren't trained (unlikely)
    regressor, classifier, label_encoders, pipeline_info = None, None, {}, {}

# Load Dataset for Autocomplete and lookup maps
print("--- Building Dataset-driven Lookups ---")
if DATASET_PATH.exists():
    df = pd.read_csv(DATASET_PATH)
    # Remove any NaN state/district rows
    df = df.dropna(subset=["state", "district", "crop", "season"])
    
    # 1. Unique sorted lists
    states_list = sorted(df["state"].unique().tolist())
    crops_list = sorted(df["crop"].unique().tolist())
    seasons_list = sorted(df["season"].unique().tolist())
    
    # 2. State-to-district mapping
    state_district_map = {}
    for state, group in df.groupby("state"):
        state_district_map[state] = sorted(group["district"].unique().tolist())
        
    # 3. District-to-rainfall lookup
    # Group by district first (or state, district)
    district_rainfall = df.groupby("district")["monthly_rainfall"].mean().to_dict()
    
    # 4. District metadata (population, growth, literacy) lookup
    district_metadata = {}
    for (state, district), group in df.groupby(["state", "district"]):
        row = group.iloc[0]
        key = (state.lower().strip(), district.lower().strip())
        district_metadata[key] = {
            "population": int(row["population"]),
            "growth": float(row["growth"]),
            "literacy": float(row["literacy"]),
            "monthly_rainfall": float(row["monthly_rainfall"])
        }
    print(f"Lookups built successfully. States: {len(states_list)}, Crops: {len(crops_list)}")
else:
    print("Warning: final_dataset.csv not found. Autocomplete lists will be empty.")
    states_list, crops_list, seasons_list = [], [], []
    state_district_map, district_rainfall, district_metadata = {}, {}, {}

def get_encoded_value(le, val):
    val_str = str(val).strip()
    # Try exact match
    if val_str in le.classes_:
        return le.transform([val_str])[0]
    # Try case-insensitive match
    for c in le.classes_:
        if str(c).lower() == val_str.lower():
            return le.transform([c])[0]
    # Fallback to unknown
    if "<unknown>" in le.classes_:
        return le.transform(["<unknown>"])[0]
    return 0

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "message": "AgriStock AI Backend is running",
        "models_loaded": regressor is not None and classifier is not None
    })

@app.route("/states", methods=["GET"])
def get_states():
    return jsonify(states_list)

@app.route("/districts/<state>", methods=["GET"])
def get_districts(state):
    # Try case-insensitive matching for state
    matched_state = None
    for s in state_district_map.keys():
        if s.lower() == state.lower():
            matched_state = s
            break
    if matched_state:
        return jsonify(state_district_map[matched_state])
    return jsonify([]), 404

@app.route("/crops", methods=["GET"])
def get_crops():
    return jsonify(crops_list)

@app.route("/seasons", methods=["GET"])
def get_seasons():
    return jsonify(seasons_list)

@app.route("/rainfall/<district>", methods=["GET"])
def get_rainfall(district):
    # Try case-insensitive lookup
    for dist, rain in district_rainfall.items():
        if dist.lower() == district.lower():
            pop, growth, literacy = 1800000, 15.0, 70.0
            for (s_key, d_key), meta in district_metadata.items():
                if d_key == dist.lower():
                    pop = meta["population"]
                    growth = meta["growth"]
                    literacy = meta["literacy"]
                    break
            return jsonify({
                "district": dist,
                "monthly_rainfall": rain,
                "population": pop,
                "growth": growth,
                "literacy": literacy
            })
    return jsonify({"error": "District not found"}), 404

@app.route("/predict", methods=["POST"])
def predict():
    start_time = time.time()
    data = request.json
    if not data:
        return jsonify({"error": "No input data provided"}), 400
        
    try:
        # Extract inputs
        state = data.get("state", "").strip()
        district = data.get("district", "").strip()
        crop = data.get("crop", "").strip()
        season = data.get("season", "").strip()
        crop_year = int(data.get("crop_year", 2020))
        area = float(data.get("area", 0.0))
        production = float(data.get("production", 0.0))
        
        # Validations
        if not state or not district or not crop or not season:
            return jsonify({"error": "State, District, Crop, and Season are required"}), 400
        if area < 0 or production < 0 or crop_year < 0:
            return jsonify({"error": "Numeric values (area, production, crop_year) cannot be negative"}), 400

        # Autofill metadata (population, growth, literacy, monthly_rainfall) from lookup table
        key = (state.lower(), district.lower())
        meta = district_metadata.get(key, {
            "population": 1800000,
            "growth": 15.0,
            "literacy": 70.0,
            "monthly_rainfall": district_rainfall.get(district, 100.0)
        })
        
        # Merge input data with historical lookups
        population = int(data.get("population", meta["population"]))
        growth = float(data.get("growth", meta["growth"]))
        literacy = float(data.get("literacy", meta["literacy"]))
        monthly_rainfall = float(data.get("monthly_rainfall", meta["monthly_rainfall"]))
        
        # Validation checks on retrieved or passed numbers
        if population < 0 or growth < 0 or literacy < 0 or monthly_rainfall < 0:
            return jsonify({"error": "Negative numerical inputs are not allowed."}), 400

        # Feature Engineering: yield = production / area
        yield_val = production / area if area > 0 else 0.0

        # Encode categorical variables using label encoders
        enc_state = get_encoded_value(label_encoders["state"], state)
        enc_district = get_encoded_value(label_encoders["district"], district)
        enc_crop = get_encoded_value(label_encoders["crop"], crop)
        enc_season = get_encoded_value(label_encoders["season"], season)

        # Build feature DataFrame for Regressor
        # Columns: state, district, crop, crop_year, season, area, production, yield, population, growth, literacy, monthly_rainfall
        reg_features = pd.DataFrame([{
            "state": enc_state,
            "district": enc_district,
            "crop": enc_crop,
            "crop_year": crop_year,
            "season": enc_season,
            "area": area,
            "production": production,
            "yield": yield_val,
            "population": population,
            "growth": growth,
            "literacy": literacy,
            "monthly_rainfall": monthly_rainfall
        }])

        # Build feature DataFrame for Classifier
        # Columns: state, district, crop, crop_year, season, area, production, population, growth, literacy, monthly_rainfall
        cls_features = reg_features.drop(columns=["yield"])

        # Align features to fit format
        if hasattr(regressor, "feature_names_in_"):
            reg_features = reg_features.reindex(columns=regressor.feature_names_in_).fillna(0)
        if hasattr(classifier, "feature_names_in_"):
            cls_features = cls_features.reindex(columns=classifier.feature_names_in_).fillna(0)

        # Predictions
        pred_demand = float(regressor.predict(reg_features)[0])
        
        cls_probs = classifier.predict_proba(cls_features)[0]
        pred_cls_idx = classifier.predict(cls_features)[0]
        confidence_score = float(cls_probs[pred_cls_idx])
        
        # Decode risk class string
        risk_classes = label_encoders["risk_level"].classes_
        predicted_risk = str(risk_classes[pred_cls_idx])
        
        # Calculate prediction time in ms
        prediction_time_ms = round((time.time() - start_time) * 1000, 2)

        return jsonify({
            "predicted_demand": pred_demand,
            "predicted_risk": predicted_risk,
            "confidence_score": confidence_score,
            "prediction_time_ms": prediction_time_ms,
            "input_metadata": {
                "population": population,
                "growth": growth,
                "literacy": literacy,
                "monthly_rainfall": monthly_rainfall,
                "yield": yield_val
            }
        })

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)