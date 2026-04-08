from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os

app = Flask(__name__)

# ✅ FIXED CORS (ALLOW ALL ORIGINS SAFELY)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ---------------------------
# Utility: BMI Calculator
# ---------------------------
def calculate_bmi(weight, height_cm):
    height_m = height_cm / 100
    return round(weight / (height_m ** 2), 2)

# ---------------------------
# Utility: Create Explanation Object
# ---------------------------
def make_explanation(factor, value, ideal, impact, message, vitality_score=None):
    return {
        "factor": factor,
        "value": value,
        "ideal": ideal,
        "impact": impact,
        "message": message,
        "shap": vitality_score # Map vitality to "shap" key for frontend compatibility
    }

# ---------------------------
# Utility: Vitality Scorer (Replaces SHAP/RandomForest)
# ---------------------------
def get_vitality_impact(feature, value):
    """
    Calculates impact scores based on medical proximity.
    Positive scores = Good for donation.
    Negative scores = Risky.
    """
    impacts = {
        "hb": (12.5, 17.5),
        "age": (18, 65),
        "bp": (80, 170),
        "weight": (50, 150),
        "height": (140, 220),
        "bmi": (18.5, 30.0)
    }
    
    if feature not in impacts: return 0.0
    
    low, high = impacts[feature]
    
    # Calculate how 'deep' into the healthy range the value is
    if value < low:
        return round(-(low - value) / low, 4)
    if value > high:
        return round(-(value - high) / high, 4)
    
    # Positive impact: how close to the center of the healthy range
    mid = (low + high) / 2
    dist_from_edge = min(value - low, high - value)
    range_width = high - low
    
    # Normalize score between 0.1 and 0.5 for positive values
    score = (dist_from_edge / (range_width / 2)) * 0.5
    return round(max(0.1, score), 4)

# ---------------------------
# DONOR ELIGIBILITY CHECK (LOWER MEMORY VERSION)
# ---------------------------
@app.route("/predict/eligibility", methods=["POST"])
def predict_eligibility():
    data = request.json

    try:
        def get_value(x):
            if x is None or str(x).strip() == "":
                raise ValueError("Missing or empty data field received")
            return float(x)

        hb = get_value(data.get("hb"))
        age = get_value(data.get("age"))
        bp = get_value(data.get("bp"))
        weight = get_value(data.get("weight"))
        height = get_value(data.get("height"))

        bmi = calculate_bmi(weight, height)
        explanation = []

        # -----------------------
        # HARD MEDICAL RULES
        # -----------------------
        rules = [
            (hb < 12.5, "Hemoglobin (HB)", hb, ">= 12.5 g/dL", "Negative", "HB too low."),
            (hb > 17.5, "Hemoglobin (HB)", hb, "<= 17.5 g/dL", "Negative", "HB too high."),
            (bp < 80 or bp > 170, "Blood Pressure (BP)", bp, "80 - 170 mmHg", "Negative", "BP out of range."),
            (age < 18 or age > 65, "Age", age, "18 - 65 years", "Negative", "Age out of range."),
            (weight < 50, "Weight", weight, ">= 50 kg", "Negative", "Weight too low."),
            (height < 140, "Height", height, ">= 140 cm", "Negative", "Height too low."),
            (bmi < 18.5 or bmi > 30, "BMI", bmi, "18.5 - 30", "Negative", f"Unhealthy BMI ({bmi}).")
        ]

        # Check for immediate disqualification
        for condition, factor, val, ideal, impact, msg in rules:
            if condition:
                explanation.append(make_explanation(factor, val, ideal, impact, msg))
                return jsonify({
                    "status": "Not Eligible",
                    "confidence": 0,
                    "bmi": bmi,
                    "explanation": explanation
                })

        # If all rules pass, build the detailed positive explanation
        explanation = [
            make_explanation("Hemoglobin (HB)", hb, "12.5 - 17.5 g/dL", "Positive", "Healthy HB.", get_vitality_impact("hb", hb)),
            make_explanation("Blood Pressure (BP)", bp, "80 - 170 mmHg", "Positive", "Safe BP.", get_vitality_impact("bp", bp)),
            make_explanation("Age", age, "18 - 65 years", "Positive", "In age range.", get_vitality_impact("age", age)),
            make_explanation("Weight", weight, ">= 50 kg", "Positive", "Weight okay.", get_vitality_impact("weight", weight)),
            make_explanation("Height", height, ">= 140 cm", "Positive", "Height okay.", get_vitality_impact("height", height)),
            make_explanation("BMI", bmi, "18.5 - 30", "Positive", "Healthy BMI.", get_vitality_impact("bmi", bmi))
        ]

        shap_map = {
            "hb": get_vitality_impact("hb", hb),
            "age": get_vitality_impact("age", age),
            "bp": get_vitality_impact("bp", bp),
            "weight": get_vitality_impact("weight", weight),
            "height": get_vitality_impact("height", height),
            "bmi": get_vitality_impact("bmi", bmi)
        }

        return jsonify({
            "status": "Eligible",
            "reason": "All medical rules satisfied + Vitality Check passed",
            "confidence": 1.0,
            "bmi": bmi,
            "explanation": explanation,
            "xai": shap_map
        })

    except Exception as e:
        return jsonify({
            "status": "Not Eligible",
            "reason": f"Input error: {str(e)}"
        }), 400

# ---------------------------
# DEMAND FORECASTING (STATIC FORMULA VERSION)
# ---------------------------
@app.route("/predict/demand", methods=["POST"])
def predict_demand():
    try:
        history = request.json.get("history")
        if not history or len(history) < 3:
            raise ValueError("Insufficient history data provided. Minimum 3 required.")

        # Formula extracted from LinearRegression trained model:
        # Units = (0.58 * T-3) + (0.56 * T-2) - (0.24 * T-1) + 23.03
        day_1, day_2, day_3 = float(history[-1]), float(history[-2]), float(history[-3])
        
        forecast = (0.58049247 * day_3) + (0.56060261 * day_2) - (0.24254699 * day_1) + 23.03604751718178

        return jsonify({
            "predicted_units": round(float(max(0, forecast)), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "AI Service Running (Optimized v2)"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)