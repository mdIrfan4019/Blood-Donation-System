import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.preprocessing.sequence import TimeseriesGenerator

# dummy demand data
data = np.array([50, 60, 55, 70, 80, 65, 90, 85, 100, 95])

# reshape for LSTM
data = data.reshape(-1, 1)

gen = TimeseriesGenerator(data, data, length=3, batch_size=1)

model = Sequential()
model.add(LSTM(50, activation="relu", input_shape=(3, 1)))
model.add(Dense(1))
model.compile(optimizer="adam", loss="mse")

model.fit(gen, epochs=20, verbose=1)

model.save("../models/demand_forecast_model.h5")

print("✅ Demand forecasting model trained & saved")
