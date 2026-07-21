import sys
import os
import json
import unittest

# Add backend directory to system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from app import app

class TestAgriStockAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_home(self):
        response = self.app.get("/")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["models_loaded"], True)

    def test_states(self):
        response = self.app.get("/states")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(data, list))
        self.assertIn("Andhra Pradesh", data)

    def test_districts_valid(self):
        response = self.app.get("/districts/Andhra Pradesh")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(data, list))
        self.assertIn("ANANTAPUR", data)

    def test_districts_invalid(self):
        response = self.app.get("/districts/NonExistentState")
        self.assertEqual(response.status_code, 404)

    def test_crops(self):
        response = self.app.get("/crops")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(data, list))
        self.assertIn("Arecanut", data)

    def test_seasons(self):
        response = self.app.get("/seasons")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(data, list))
        self.assertIn("Kharif", data)

    def test_rainfall_valid(self):
        response = self.app.get("/rainfall/ANANTAPUR")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["district"], "ANANTAPUR")
        self.assertTrue(data["monthly_rainfall"] > 0)

    def test_rainfall_invalid(self):
        response = self.app.get("/rainfall/NonExistentDistrict")
        self.assertEqual(response.status_code, 404)

    def test_predict_valid(self):
        payload = {
            "state": "Andhra Pradesh",
            "district": "ANANTAPUR",
            "crop": "Arecanut",
            "season": "Kharif",
            "crop_year": 2020,
            "area": 2500,
            "production": 3500
        }
        response = self.app.post("/predict", data=json.dumps(payload), content_type="application/json")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("predicted_demand", data)
        self.assertIn("predicted_risk", data)
        self.assertIn("confidence_score", data)
        self.assertIn("prediction_time_ms", data)
        self.assertIn("input_metadata", data)
        
        self.assertTrue(data["predicted_demand"] > 0)
        self.assertIn(data["predicted_risk"], ["High Risk", "Moderate Risk", "Low Risk", "High", "Moderate", "Low"])
        self.assertTrue(0 <= data["confidence_score"] <= 1)
        self.assertTrue(data["input_metadata"]["monthly_rainfall"] > 0)

    def test_predict_invalid_missing_fields(self):
        payload = {
            "district": "ANANTAPUR",
            "crop": "Arecanut",
            "season": "Kharif",
            "area": 2500,
            "production": 3500
        }
        response = self.app.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_predict_invalid_negative_values(self):
        payload = {
            "state": "Andhra Pradesh",
            "district": "ANANTAPUR",
            "crop": "Arecanut",
            "season": "Kharif",
            "area": -10,
            "production": 3500
        }
        response = self.app.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_predict_invalid_state_district_combination(self):
        # LUCKNOW is in Uttar Pradesh, not Andhra Pradesh
        payload = {
            "state": "Andhra Pradesh",
            "district": "LUCKNOW",
            "crop": "Arecanut",
            "season": "Kharif",
            "area": 2500,
            "production": 3500
        }
        response = self.app.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

if __name__ == "__main__":
    unittest.main()
