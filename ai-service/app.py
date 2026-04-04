from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import shap
import os

app = Flask(__name__)

allowed_origins = ["http://localhost:5173", "http://localhost:5174"]
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

CORS(app, origins=allowed_origins)


# load models
eligibility_model = joblib.load("models/eligibility_model.pkl")
forecast_model = joblib.load("models/demand_forecast_model.pkl")
shap_explainer = shap.TreeExplainer(eligibility_model)



# ---------------------------
# Utility: BMI Calculator
# ---------------------------
def calculate_bmi(weight, height_cm):
    height_m = height_cm / 100
    return round(weight / (height_m ** 2), 2)


# ---------------------------
# Utility: Create Explanation Object
# ---------------------------
def make_explanation(factor, value, ideal, impact, message, shap_value=None):
    return {
        "factor": factor,
        "value": value,
        "ideal": ideal,
        "impact": impact,
        "message": message,
        "shap": shap_value
    }


# ---------------------------
# DONOR ELIGIBILITY CHECK
# ---------------------------
@app.route("/predict/eligibility", methods=["POST"])
def predict_eligibility():
    data = request.json

    try:
        hb = float(data["hb"])
        age = float(data["age"])
        bp = float(data["bp"])
        weight = float(data["weight"])
        height = float(data["height"])

        bmi = calculate_bmi(weight, height)

        explanation = []

        # -----------------------
        # HARD MEDICAL RULES + EXPLANATION
        # -----------------------

        # Hemoglobin
        if hb < 12.5:
            explanation.append(make_explanation(
                "Hemoglobin (HB)", hb, ">= 12.5 g/dL", "Negative",
                "Hemoglobin is too low. Donation is unsafe."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        if hb > 17.5:
            explanation.append(make_explanation(
                "Hemoglobin (HB)", hb, "<= 17.5 g/dL", "Negative",
                "Hemoglobin is too high. Donation not recommended."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        explanation.append(make_explanation(
            "Hemoglobin (HB)", hb, "12.5 - 17.5 g/dL", "Positive",
            "Hemoglobin level is healthy for donation."
        ))

        # Blood Pressure
        if bp < 80 or bp > 170:
            explanation.append(make_explanation(
                "Blood Pressure (BP)", bp, "80 - 170 mmHg", "Negative",
                "Blood pressure is outside safe range for donation."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        explanation.append(make_explanation(
            "Blood Pressure (BP)", bp, "80 - 170 mmHg", "Positive",
            "Blood pressure is within safe range."
        ))

        # Age
        if age < 18 or age > 65:
            explanation.append(make_explanation(
                "Age", age, "18 - 65 years", "Negative",
                "Age is outside donation eligibility range."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        explanation.append(make_explanation(
            "Age", age, "18 - 65 years", "Positive",
            "Age is within donation eligibility range."
        ))

        # Weight
        if weight < 50:
            explanation.append(make_explanation(
                "Weight", weight, ">= 50 kg", "Negative",
                "Weight is too low. Minimum 50kg required."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        explanation.append(make_explanation(
            "Weight", weight, ">= 50 kg", "Positive",
            "Weight is sufficient for donation."
        ))

        # Height (Rule based check)
        if height < 140:
            explanation.append(make_explanation(
                "Height", height, ">= 140 cm", "Negative",
                "Height is too low. Donation may be risky."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        explanation.append(make_explanation(
            "Height", height, ">= 140 cm", "Positive",
            "Height is acceptable."
        ))

        # BMI
        if bmi < 18.5 or bmi > 30:
            explanation.append(make_explanation(
                "BMI", bmi, "18.5 - 30", "Negative",
                f"Unhealthy BMI ({bmi}). Donation not recommended."
            ))
            return jsonify({
                "status": "Not Eligible",
                "confidence": 0,
                "bmi": bmi,
                "explanation": explanation
            })

        explanation.append(make_explanation(
            "BMI", bmi, "18.5 - 30", "Positive",
            "BMI is within healthy donation range."
        ))

        # -----------------------
        # ML + XAI PREDICTION
        # -----------------------
        features_df = pd.DataFrame([{
            "hb": hb,
            "age": age,
            "bp": bp,
            "weight": weight,
            "height": height,
            "bmi": bmi
        }])

        pred = eligibility_model.predict(features_df)[0]
        proba = eligibility_model.predict_proba(features_df)[0][1]

        shap_values = shap_explainer(features_df)
        shap_values = shap_values.values[0]

        shap_map = {
            feature: round(float(value), 4)
            for feature, value in zip(features_df.columns, shap_values)
        }

        # Attach SHAP to explanation items (optional)
        for e in explanation:
            key = e["factor"].split(" ")[0].lower()  # rough mapping
            if "Hemoglobin" in e["factor"]:
                e["shap"] = shap_map.get("hb")
            elif "Age" in e["factor"]:
                e["shap"] = shap_map.get("age")
            elif "Blood Pressure" in e["factor"]:
                e["shap"] = shap_map.get("bp")
            elif "Weight" in e["factor"]:
                e["shap"] = shap_map.get("weight")
            elif "Height" in e["factor"]:
                e["shap"] = shap_map.get("height")
            elif "BMI" in e["factor"]:
                e["shap"] = shap_map.get("bmi")

        # Final Result
        result = "Eligible" if int(pred) == 1 else "Not Eligible"

        final_reason = (
            "All medical rules satisfied + AI model confirms eligibility"
            if int(pred) == 1
            else "Medical rules passed but AI model flagged risk factors"
        )

        return jsonify({
            "status": result,
            "reason": final_reason,
            "confidence": round(float(proba), 3),
            "bmi": bmi,
            "explanation": explanation,
            "xai": shap_map
        })

    except Exception as e:
        return jsonify({
            "status": "Not Eligible",
            "reason": f"Invalid input or server error: {str(e)}"
        }), 500


# ---------------------------
# DEMAND FORECASTING
# ---------------------------
@app.route("/predict/demand", methods=["POST"])
def predict_demand():
    history = request.json["history"]

    series = np.array(history).reshape(-1, 1)

    # take last 3 values
    last_seq = series[-3:].reshape(1, -1)

    forecast = forecast_model.predict(last_seq)

    return jsonify({
        "predicted_units": float(forecast[0][0])
    })


@app.route("/")
def home():
    return "AI Service Running"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
