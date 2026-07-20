import pandas as pd
import numpy as np
import os
import time
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, KFold, cross_val_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)

# Set directories
dataset_path = r"C:\Users\anime\AgriStock-AI\dataset\processed\final_dataset.csv"
model_dir = r"C:\Users\anime\AgriStock-AI\models"
docs_dir = r"C:\Users\anime\AgriStock-AI\docs"
os.makedirs(model_dir, exist_ok=True)
os.makedirs(docs_dir, exist_ok=True)

print("--- Step 1: Loading Processed Dataset ---")
if not os.path.exists(dataset_path):
    raise FileNotFoundError(f"Processed dataset not found at {dataset_path}")

df = pd.read_csv(dataset_path)
print(f"Loaded dataset shape: {df.shape}")

# Drop duplicates if any
initial_rows = len(df)
df = df.drop_duplicates()
print(f"Dropped {initial_rows - len(df)} duplicate rows. New shape: {df.shape}")

# Validate missing values
print("Missing values per column:")
print(df.isnull().sum())

# Define columns
categorical_cols = ["state", "district", "crop", "season"]
num_cols = ["crop_year", "area", "production", "population", "growth", "literacy", "monthly_rainfall"]

# Step 2: Categorical Encoding
print("\n--- Step 2: Categorical Encoding ---")
label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    # Fit on unique classes plus an unknown placeholder
    unique_vals = list(df[col].astype(str).unique())
    # Add a fallback placeholder
    unique_vals.append("<unknown>")
    le.fit(unique_vals)
    df[col] = le.transform(df[col].astype(str))
    label_encoders[col] = le

# Save label encoders dict
joblib.dump(label_encoders, os.path.join(model_dir, "label_encoders.pkl"))
print("Label encoders saved to label_encoders.pkl")

# Step 3: Train-Test Split & Features for Demand Regressor
print("\n--- Step 3: Preparing Agricultural Demand Regressor ---")
X_reg = df[categorical_cols + num_cols + ["yield"]].copy()
y_reg = df["demand"].copy()

X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(
    X_reg, y_reg, test_size=0.2, random_state=42
)
print(f"Regression Train Shape: {X_train_reg.shape}, Test Shape: {X_test_reg.shape}")

# Hyperparameter Tuning using GridSearchCV on a representative sample
print("\n--- Tuning Regressor with GridSearchCV ---")
grid_sample_size = min(10000, len(X_train_reg))
sample_indices = np.random.choice(X_train_reg.index, size=grid_sample_size, replace=False)
X_train_reg_sample = X_train_reg.loc[sample_indices]
y_train_reg_sample = y_train_reg.loc[sample_indices]

# Parameter grid
param_grid = {
    'n_estimators': [50, 100],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5]
}

rf_reg = RandomForestRegressor(random_state=42, n_jobs=-1)
grid_reg = GridSearchCV(
    estimator=rf_reg,
    param_grid=param_grid,
    cv=5,
    scoring='r2',
    n_jobs=-1,
    verbose=1
)

start_time = time.time()
grid_reg.fit(X_train_reg_sample, y_train_reg_sample)
print(f"Regressor GridSearch completed in {time.time() - start_time:.2f} seconds")
print(f"Best Regressor parameters: {grid_reg.best_params_}")
print(f"Best Regressor score (CV R2): {grid_reg.best_score_:.4f}")

# Train the final regressor on the FULL dataset
print("\n--- Training Final Regressor on Full Dataset ---")
final_rf_reg = RandomForestRegressor(**grid_reg.best_params_, random_state=42, n_jobs=-1)
final_rf_reg.fit(X_train_reg, y_train_reg)

# Evaluate Regressor
y_pred_reg = final_rf_reg.predict(X_test_reg)
r2 = r2_score(y_test_reg, y_pred_reg)
rmse = np.sqrt(mean_squared_error(y_test_reg, y_pred_reg))
mae = mean_absolute_error(y_test_reg, y_pred_reg)
mse = mean_squared_error(y_test_reg, y_pred_reg)

print("\n--- Regressor Metrics on Test Set ---")
print(f"R2 Score: {r2:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"MAE: {mae:.4f}")
print(f"MSE: {mse:.4f}")

# Save regressor
joblib.dump(final_rf_reg, os.path.join(model_dir, "best_model_regressor.pkl"))
# Also save as the app-expected name to maintain compatibility
joblib.dump(final_rf_reg, os.path.join(model_dir, "demand_prediction_model.pkl"))
print("Regressor models saved successfully.")

# Step 4: Preparing Crop Risk Classifier
print("\n--- Step 4: Preparing Crop Risk Classifier ---")
# Feature list (yield is dropped to prevent target leakage)
X_cls = df[categorical_cols + num_cols].copy()

# Target risk level: encode High -> 2, Moderate -> 1, Low -> 0 (or alphabetical)
# We can use a label encoder for risk_level
risk_le = LabelEncoder()
y_cls = risk_le.fit_transform(df["risk_level"].astype(str))
label_encoders["risk_level"] = risk_le
# Save updated label encoders dict
joblib.dump(label_encoders, os.path.join(model_dir, "label_encoders.pkl"))

X_train_cls, X_test_cls, y_train_cls, y_test_cls = train_test_split(
    X_cls, y_cls, test_size=0.2, random_state=42, stratify=y_cls
)
print(f"Classifier Train Shape: {X_train_cls.shape}, Test Shape: {X_test_cls.shape}")

# Tuning Classifier with GridSearchCV on sample
print("\n--- Tuning Classifier with GridSearchCV ---")
grid_sample_size_cls = min(10000, len(X_train_cls))
# Stratified sample
X_train_cls_sample, _, y_train_cls_sample, _ = train_test_split(
    X_train_cls, y_train_cls, train_size=grid_sample_size_cls, random_state=42, stratify=y_train_cls
)

rf_cls = RandomForestClassifier(random_state=42, n_jobs=-1)
grid_cls = GridSearchCV(
    estimator=rf_cls,
    param_grid=param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=1
)

start_time = time.time()
grid_cls.fit(X_train_cls_sample, y_train_cls_sample)
print(f"Classifier GridSearch completed in {time.time() - start_time:.2f} seconds")
print(f"Best Classifier parameters: {grid_cls.best_params_}")
print(f"Best Classifier score (CV Accuracy): {grid_cls.best_score_:.4f}")

# Train the final classifier on the FULL dataset
print("\n--- Training Final Classifier on Full Dataset ---")
final_rf_cls = RandomForestClassifier(**grid_cls.best_params_, random_state=42, n_jobs=-1)
final_rf_cls.fit(X_train_cls, y_train_cls)

# Evaluate Classifier
y_pred_cls = final_rf_cls.predict(X_test_cls)
y_pred_proba = final_rf_cls.predict_proba(X_test_cls)

accuracy = accuracy_score(y_test_cls, y_pred_cls)
precision = precision_score(y_test_cls, y_pred_cls, average='weighted')
recall = recall_score(y_test_cls, y_pred_cls, average='weighted')
f1 = f1_score(y_test_cls, y_pred_cls, average='weighted')

try:
    roc_auc = roc_auc_score(y_test_cls, y_pred_proba, multi_class='ovr', average='weighted')
except Exception as e:
    roc_auc = "N/A"

cm = confusion_matrix(y_test_cls, y_pred_cls)
report = classification_report(y_test_cls, y_pred_cls, target_names=risk_le.classes_)

print("\n--- Classifier Metrics on Test Set ---")
print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")
print(f"ROC-AUC Score: {roc_auc}")
print("\nConfusion Matrix:")
print(cm)
print("\nClassification Report:")
print(report)

# Save classifier
joblib.dump(final_rf_cls, os.path.join(model_dir, "best_model_classifier.pkl"))
# Also save as the app-expected name to maintain compatibility
joblib.dump(final_rf_cls, os.path.join(model_dir, "risk_classification_model.pkl"))
print("Classifier models saved successfully.")

# Step 5: Save Preprocessing Pipeline
# Let's save a dictionary configuration that the backend can load to preprocess inputs
preprocessing_pipeline = {
    "categorical_cols": categorical_cols,
    "num_cols": num_cols,
    "feature_names_regressor": list(X_reg.columns),
    "feature_names_classifier": list(X_cls.columns),
    "risk_classes": list(risk_le.classes_)
}
joblib.dump(preprocessing_pipeline, os.path.join(model_dir, "preprocessing_pipeline.pkl"))
print("Preprocessing pipeline saved to preprocessing_pipeline.pkl")

# Step 6: Generate feature importances & docs
print("\n--- Step 6: Generating Metrics Report ---")
reg_importances = final_rf_reg.feature_importances_
cls_importances = final_rf_cls.feature_importances_

def df_to_markdown(df):
    cols = list(df.columns)
    headers = "| " + " | ".join(cols) + " |"
    separator = "| " + " | ".join(["---"] * len(cols)) + " |"
    rows = []
    for idx, row in df.iterrows():
        rows.append("| " + " | ".join([f"{val:.6f}" if isinstance(val, float) else str(val) for val in row]) + " |")
    return "\n".join([headers, separator] + rows)

reg_importance_df = pd.DataFrame({
    'Feature': X_reg.columns,
    'Importance': reg_importances
}).sort_values(by='Importance', ascending=False)

cls_importance_df = pd.DataFrame({
    'Feature': X_cls.columns,
    'Importance': cls_importances
}).sort_values(by='Importance', ascending=False)

# Write report
report_content = f"""# AgriStock AI Model Performance & Metrics Report

This document reports the performance metrics, hyperparameter tuning results, and feature importances for the AgriStock AI models.

## 1. Agricultural Demand Regressor

**Goal**: Predict the agricultural demand value.
- **Model**: `RandomForestRegressor`
- **Tuning Method**: 5-Fold Cross-Validation via GridSearchCV
- **GridSearchCV Best Parameters**: {grid_reg.best_params_}
- **GridSearchCV Best CV R² Score**: {grid_reg.best_score_:.4f}

### Test Set Performance Metrics
- **R² Score**: {r2:.4f} (Indicates high predictive power)
- **RMSE**: {rmse:.4f}
- **MAE**: {mae:.4f}
- **MSE**: {mse:.4f}

### Regressor Feature Importance
{df_to_markdown(reg_importance_df)}

---

## 2. Crop Risk Classifier

**Goal**: Classify crop risk level into Low, Moderate (Medium), or High.
- **Model**: `RandomForestClassifier`
- **Tuning Method**: 5-Fold Cross-Validation via GridSearchCV
- **GridSearchCV Best Parameters**: {grid_cls.best_params_}
- **GridSearchCV Best CV Accuracy**: {grid_cls.best_score_:.4f}

### Test Set Performance Metrics
- **Accuracy**: {accuracy:.4f}
- **Precision (Weighted)**: {precision:.4f}
- **Recall (Weighted)**: {recall:.4f}
- **F1 Score (Weighted)**: {f1:.4f}
- **ROC-AUC (Weighted)**: {roc_auc if isinstance(roc_auc, str) else f"{roc_auc:.4f}"}

### Classification Report
```
{report}
```

### Classifier Feature Importance
{df_to_markdown(cls_importance_df)}

---

Report generated on: {pd.Timestamp.now()}
"""

with open(os.path.join(docs_dir, "metrics_report.md"), "w", encoding="utf-8") as f:
    f.write(report_content)
print(f"Metrics report saved to {os.path.join(docs_dir, 'metrics_report.md')}")
print("Training Pipeline Complete!")

