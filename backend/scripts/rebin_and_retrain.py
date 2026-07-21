import pandas as pd
import numpy as np
import os
import time
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)

dataset_path = r"C:\Users\anime\AgriStock-AI\dataset\processed\final_dataset.csv"
model_dir = r"C:\Users\anime\AgriStock-AI\models"
docs_dir = r"C:\Users\anime\AgriStock-AI\docs"

print("--- Step 1: Loading Dataset & Re-binning Risk Levels ---")
df = pd.read_csv(dataset_path)

# Calculate yield if missing
if "yield" not in df.columns or df["yield"].isnull().any():
    df["yield"] = df["production"] / df["area"].replace(0, np.nan)
    df["yield"] = df["yield"].fillna(0)

# Re-bin yield into 3 balanced quantile risk categories:
# Low Risk (Top 33% yield), Moderate Risk (Middle 34% yield), High Risk (Bottom 33% yield)
quantiles = df["yield"].quantile([0.33, 0.66]).values
qlow, qhigh = quantiles[0], quantiles[1]

def assign_risk(y):
    if y <= qlow:
        return "High Risk"
    elif y <= qhigh:
        return "Moderate Risk"
    else:
        return "Low Risk"

df["risk_level"] = df["yield"].apply(assign_risk)

print("\n--- Balanced Risk Level Class Distribution ---")
print(df["risk_level"].value_counts(normalize=True))
print(df["risk_level"].value_counts())

# Save balanced dataset back to disk
df.to_csv(dataset_path, index=False)

# Step 2: Categorical Encoding
categorical_cols = ["state", "district", "crop", "season"]
num_cols = ["crop_year", "area", "production", "population", "growth", "literacy", "monthly_rainfall"]

label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    unique_vals = list(df[col].astype(str).unique())
    unique_vals.append("<unknown>")
    le.fit(unique_vals)
    df[col] = le.transform(df[col].astype(str))
    label_encoders[col] = le

# Regressor training
print("\n--- Training Demand Regressor ---")
X_reg = df[categorical_cols + num_cols + ["yield"]].copy()
y_reg = df["demand"].copy()

X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(
    X_reg, y_reg, test_size=0.2, random_state=42
)

final_rf_reg = RandomForestRegressor(n_estimators=100, max_depth=20, random_state=42, n_jobs=-1)
final_rf_reg.fit(X_train_reg, y_train_reg)

y_pred_reg = final_rf_reg.predict(X_test_reg)
r2 = r2_score(y_test_reg, y_pred_reg)
rmse = np.sqrt(mean_squared_error(y_test_reg, y_pred_reg))
mae = mean_absolute_error(y_test_reg, y_pred_reg)
print(f"Regressor R2: {r2:.4f}, RMSE: {rmse:.4f}, MAE: {mae:.4f}")

joblib.dump(final_rf_reg, os.path.join(model_dir, "best_model_regressor.pkl"))
joblib.dump(final_rf_reg, os.path.join(model_dir, "demand_prediction_model.pkl"))

# Classifier training with class_weight='balanced' and 5-Fold GridSearchCV
print("\n--- Training Balanced Crop Risk Classifier ---")
X_cls = df[categorical_cols + num_cols].copy()

risk_le = LabelEncoder()
# Ensure classes are encoded deterministically: Low Risk, Moderate Risk, High Risk
y_cls = risk_le.fit_transform(df["risk_level"].astype(str))
label_encoders["risk_level"] = risk_le
joblib.dump(label_encoders, os.path.join(model_dir, "label_encoders.pkl"))

X_train_cls, X_test_cls, y_train_cls, y_test_cls = train_test_split(
    X_cls, y_cls, test_size=0.2, random_state=42, stratify=y_cls
)

param_grid_cls = {
    'n_estimators': [50, 100],
    'max_depth': [12, 20, None],
    'min_samples_split': [2, 5],
    'class_weight': ['balanced', 'balanced_subsample']
}

rf_cls = RandomForestClassifier(random_state=42, n_jobs=-1)
grid_cls = GridSearchCV(
    estimator=rf_cls,
    param_grid=param_grid_cls,
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=1
)

grid_sample_size = min(15000, len(X_train_cls))
X_sample, _, y_sample, _ = train_test_split(
    X_train_cls, y_train_cls, train_size=grid_sample_size, random_state=42, stratify=y_train_cls
)

grid_cls.fit(X_sample, y_sample)
print(f"Best Classifier CV Params: {grid_cls.best_params_}")
print(f"Best Classifier CV F1 Score: {grid_cls.best_score_:.4f}")

# Train final model on full training set
final_rf_cls = RandomForestClassifier(**grid_cls.best_params_, random_state=42, n_jobs=-1)
final_rf_cls.fit(X_train_cls, y_train_cls)

# Evaluate Classifier on Test Set
y_pred_cls = final_rf_cls.predict(X_test_cls)
y_pred_proba = final_rf_cls.predict_proba(X_test_cls)

accuracy = accuracy_score(y_test_cls, y_pred_cls)
precision = precision_score(y_test_cls, y_pred_cls, average='weighted')
recall = recall_score(y_test_cls, y_pred_cls, average='weighted')
f1 = f1_score(y_test_cls, y_pred_cls, average='weighted')
cm = confusion_matrix(y_test_cls, y_pred_cls)
report = classification_report(y_test_cls, y_pred_cls, target_names=risk_le.classes_)

print("\n--- Classifier Metrics on Test Set ---")
print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")
print("\nConfusion Matrix:")
print(cm)
print("\nClassification Report:")
print(report)

joblib.dump(final_rf_cls, os.path.join(model_dir, "best_model_classifier.pkl"))
joblib.dump(final_rf_cls, os.path.join(model_dir, "risk_classification_model.pkl"))

preprocessing_pipeline = {
    "categorical_cols": categorical_cols,
    "num_cols": num_cols,
    "feature_names_regressor": list(X_reg.columns),
    "feature_names_classifier": list(X_cls.columns),
    "risk_classes": list(risk_le.classes_)
}
joblib.dump(preprocessing_pipeline, os.path.join(model_dir, "preprocessing_pipeline.pkl"))
print("\nModel retraining and saving complete!")
