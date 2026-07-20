# AgriStock AI 🌾

**AgriStock AI** is a production-ready, enterprise-grade AI SaaS web application designed to forecast agricultural demand and evaluate crop risk levels using real-world farming parameters across Indian states and districts.

---

## 🚀 Key Features

* **Machine Learning Powered Projections**:
  * **Agricultural Demand Regressor**: Built with `RandomForestRegressor`, tuned via 5-Fold Cross-Validation & `GridSearchCV`. Achieves **R² = 1.00**.
  * **Crop Risk Level Classifier**: Built with `RandomForestClassifier` (`Low`, `Moderate`, `High` classes), tuned via 5-Fold Cross-Validation & `GridSearchCV`. Achieves **99.9% Accuracy** and **0.999 Weighted F1-Score**.
* **Dataset-Driven Autocomplete**:
  * Autocomplete fields for **State**, **District**, **Crop**, and **Season** fetched directly from backend dataset lookup tables.
  * Instant auto-population of average monthly rainfall, district population, growth index, and literacy rates upon selecting a district.
  * Keyboard navigable (Arrow Up/Down, Enter, Escape, Tab), prefix and contains matching, alphabetical sorting, and WAI-ARIA accessible.
* **Modern Enterprise UI/UX**:
  * Designed following modern SaaS aesthetic guidelines (Vercel, Linear, Stripe).
  * Smooth Framer Motion page animations, glassmorphism cards, and soft ambient background gradients.
  * Interactive **Recharts** visualizing Supply vs. Demand balance and regional climate metrics.
  * Animated circular risk gauge (`CircularRisk`) with color coding (Green for Low Risk, Amber for Moderate Risk, Red for High Risk).
  * Full **Dark Mode** support with preference saved in Local Storage.

---

## 🛠️ Technology Stack

### Machine Learning & Data Processing
* **Python 3.12+**
* **Pandas** & **NumPy**: Data cleaning, text normalization, and dataset merging.
* **Scikit-learn**: Model development, `GridSearchCV` hyperparameter tuning, 5-fold cross-validation, and metrics evaluation.
* **Joblib**: Model serialization (`best_model_regressor.pkl`, `best_model_classifier.pkl`, `preprocessing_pipeline.pkl`, `label_encoders.pkl`).

### Backend API
* **Flask**: Micro-framework handling HTTP routing.
* **Flask-CORS**: Handling cross-origin requests.
* **Gunicorn**: Production WSGI HTTP server.

### Frontend
* **React.js** (Vite)
* **Tailwind CSS v4**: Theme tokens, responsive layout grid, dark mode selectors.
* **Framer Motion**: Page transitions and floating card animations.
* **Recharts**: Responsive chart visualizations.
* **Axios**: Asynchronous API requests.

---

## 📊 Machine Learning Metrics Summary

Detailed performance metrics are logged in [`docs/metrics_report.md`](docs/metrics_report.md).

| Model | Algorithm | Hyperparameter Optimization | Key Metrics |
|---|---|---|---|
| **Demand Regressor** | `RandomForestRegressor` | 5-Fold CV (`n_estimators: 50`, `max_depth: 20`, `min_samples_split: 2`) | **R²: 1.00**, RMSE: 0.1790, MAE: 0.0008 |
| **Risk Classifier** | `RandomForestClassifier` | 5-Fold CV (`n_estimators: 100`, `max_depth: 10`, `min_samples_split: 2`) | **Accuracy: 99.9%**, Precision: 0.999, F1-Score: 0.999 |

---

## 📥 Installation & Local Setup

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 1. Clone & Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt
pip install flask-cors gunicorn

# Run data cleaning & model training (if models are not present)
python scripts/train_models.py

# Start Flask Backend API (runs on http://localhost:5000)
python app.py
```

### 2. Set Up & Start Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite Dev Server (runs on http://localhost:5173)
npm run dev
```

Open your browser at `http://localhost:5173` to view the application.

---

## 📡 API Documentation

### Base URL: `http://localhost:5000`

#### 1. `GET /states`
Returns a sorted list of all unique states available in the dataset.
* **Response `200 OK`**:
  ```json
  ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", ...]
  ```

#### 2. `GET /districts/<state>`
Returns a list of districts belonging to the specified state.
* **Response `200 OK`**:
  ```json
  ["ANANTAPUR", "CHITTOOR", "EAST GODAVARI", ...]
  ```

#### 3. `GET /crops`
Returns a list of all crops present in the dataset.
* **Response `200 OK`**:
  ```json
  ["Arecanut", "Arhar/Tur", "Bajra", "Banana", ...]
  ```

#### 4. `GET /seasons`
Returns a list of all crop seasons.
* **Response `200 OK`**:
  ```json
  ["Autumn", "Kharif", "Rabi", "Summer", "Whole Year", "Winter"]
  ```

#### 5. `GET /rainfall/<district>`
Returns historic average monthly rainfall and demographic metadata for a district.
* **Response `200 OK`**:
  ```json
  {
    "district": "ANANTAPUR",
    "monthly_rainfall": 61.6667,
    "population": 4081148,
    "growth": 12.1,
    "literacy": 63.57
  }
  ```

#### 6. `POST /predict`
Generates predictions for agricultural demand and crop risk level.
* **Request Body**:
  ```json
  {
    "state": "Andhra Pradesh",
    "district": "ANANTAPUR",
    "crop": "Arecanut",
    "season": "Kharif",
    "area": 2500,
    "production": 3500
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "predicted_demand": 8162.296,
    "predicted_risk": "High",
    "confidence_score": 0.96,
    "prediction_time_ms": 14.2,
    "input_metadata": {
      "population": 4081148,
      "growth": 12.1,
      "literacy": 63.57,
      "monthly_rainfall": 61.6667,
      "yield": 1.4
    }
  }
  ```

---

## 🌐 Production Deployment Guide

### Deploy Backend on Render
1. Connect your repository to Render.
2. Select **Web Service** environment: **Python**.
3. Build Command: `pip install -r backend/requirements.txt && pip install flask-cors gunicorn`
4. Start Command: `gunicorn backend.app:app` (or using `Procfile`).

### Deploy Frontend on Vercel
1. Import `frontend` folder to Vercel.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variable: `VITE_API_URL` = `<YOUR_RENDER_BACKEND_URL>`

---

## 🔮 Future Enhancements

* **Real-time Satellite Weather API Sync**: Integrate live weather forecasts from OpenWeatherMap.
* **Soil Quality & NPK Ratio Parameters**: Incorporate soil nitrogen, phosphorus, and potassium levels into risk classification.
* **Multi-Language Support (i18n)**: Support regional Indian languages (Hindi, Telugu, Tamil, Marathi, Punjabi) for rural accessibility.
