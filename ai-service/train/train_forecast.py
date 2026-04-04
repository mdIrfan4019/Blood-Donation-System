from sklearn.linear_model import LinearRegression
import numpy as np
import joblib

data = np.array([50, 60, 55, 70, 80, 65, 90, 85, 100, 95])

X = []
y = []

for i in range(len(data)-3):
    X.append(data[i:i+3])
    y.append(data[i+3])

X = np.array(X)
y = np.array(y)

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, "../models/demand_forecast_model.pkl")

print("✅ Lightweight model saved")