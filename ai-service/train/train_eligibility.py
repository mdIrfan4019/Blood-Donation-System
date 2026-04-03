import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ---------------------------
# Improved dataset (with height)
# ---------------------------
data = {
    "hb":     [12.5, 10, 14, 9, 13, 11, 15, 16, 12, 10, 17, 18, 11.5, 13.2, 14.8, 13.5, 12.8, 15.2, 16.5, 14.1],
    "age":    [25,   45, 30, 50, 28, 60, 35, 40, 55, 65, 22, 70, 19,   33,   48,   27,   36,   42,   58,   31],
    "bp":     [120,  140,130,150,125,160,180,200,170,190,110,185, 90,  115,  135,  118,  128,  138,  165,  122],
    "weight": [55,   60, 70, 50, 65, 58, 80, 75, 52, 48, 68, 72, 45,  62,   59,   64,   70,   73,   55,   66],
    "height": [170,  165,175,160,172,168,180,178,169,162,174,176,158, 171,  173,  169,  177,  181,  166,  170],
    "eligible":[1,   0,  1,  0,  1,  0,  0,  0,  0,  0,  1,  0,  0,  1,   1,   1,   1,   1,   0,   1],
}

df = pd.DataFrame(data)

# ---------------------------
# Feature Engineering: BMI
# ---------------------------
df["bmi"] = df["weight"] / ((df["height"] / 100) ** 2)

# ---------------------------
# Features & Target
# ---------------------------
X = df[["hb", "age", "bp", "weight", "height", "bmi"]]
y = df["eligible"]

# ---------------------------
# Train-test split
# ---------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ---------------------------
# Better model
# ---------------------------
model = RandomForestClassifier(
    n_estimators=400,
    max_depth=8,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# ---------------------------
# Evaluation
# ---------------------------
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# ---------------------------
# SHAP Explainer (XAI)
# ---------------------------
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_train)

# Save explainer + baseline dataset
joblib.dump(explainer, "../models/shap_explainer.pkl")
joblib.dump(X_train.mean(), "../models/feature_baseline.pkl")

# ---------------------------
# Save model
# ---------------------------
joblib.dump(model, "../models/eligibility_model.pkl")
print("✅ Improved eligibility model + SHAP explainer saved")
