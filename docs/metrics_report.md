# AgriStock AI Model Performance & Metrics Report

This document reports the performance metrics, hyperparameter tuning results, and feature importances for the AgriStock AI models.

## 1. Agricultural Demand Regressor

**Goal**: Predict the agricultural demand value.
- **Model**: `RandomForestRegressor`
- **Tuning Method**: 5-Fold Cross-Validation via GridSearchCV
- **GridSearchCV Best Parameters**: {'max_depth': 20, 'min_samples_split': 2, 'n_estimators': 50}
- **GridSearchCV Best CV R² Score**: 1.0000

### Test Set Performance Metrics
- **R² Score**: 1.0000 (Indicates high predictive power)
- **RMSE**: 0.1790
- **MAE**: 0.0008
- **MSE**: 0.0320

### Regressor Feature Importance
| Feature | Importance |
| --- | --- |
| population | 0.997755 |
| district | 0.001490 |
| growth | 0.000432 |
| monthly_rainfall | 0.000219 |
| literacy | 0.000082 |
| state | 0.000023 |
| production | 0.000000 |
| area | 0.000000 |
| yield | 0.000000 |
| crop_year | 0.000000 |
| crop | 0.000000 |
| season | 0.000000 |

---

## 2. Crop Risk Classifier

**Goal**: Classify crop risk level into Low, Moderate (Medium), or High.
- **Model**: `RandomForestClassifier`
- **Tuning Method**: 5-Fold Cross-Validation via GridSearchCV
- **GridSearchCV Best Parameters**: {'max_depth': 10, 'min_samples_split': 2, 'n_estimators': 100}
- **GridSearchCV Best CV Accuracy**: 0.9993

### Test Set Performance Metrics
- **Accuracy**: 0.9999
- **Precision (Weighted)**: 0.9999
- **Recall (Weighted)**: 0.9999
- **F1 Score (Weighted)**: 0.9999
- **ROC-AUC (Weighted)**: 1.0000

### Classification Report
```
              precision    recall  f1-score   support

        High       1.00      1.00      1.00     48332
         Low       0.98      1.00      0.99       367
    Moderate       1.00      0.68      0.81        19

    accuracy                           1.00     48718
   macro avg       0.99      0.89      0.93     48718
weighted avg       1.00      1.00      1.00     48718

```

### Classifier Feature Importance
| Feature | Importance |
| --- | --- |
| production | 0.601021 |
| crop | 0.253274 |
| area | 0.056768 |
| season | 0.032483 |
| growth | 0.012507 |
| state | 0.010522 |
| population | 0.009006 |
| monthly_rainfall | 0.008551 |
| literacy | 0.007550 |
| district | 0.004178 |
| crop_year | 0.004139 |

---

Report generated on: 2026-07-21 03:01:53.531692
