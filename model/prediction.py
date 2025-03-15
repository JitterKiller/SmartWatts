import joblib
import numpy as np  # If input is in array form

# Load trained model
model = joblib.load("./model/energy_model.pkl")

# Example input data (replace with real values)
input_data = np.array([[2, 5, 631.54, 0, 1, 0, 0, 0]])  # [num_rooms, num_people, housearea, is_ac, is_tv]

# Make prediction
prediction = model.predict(input_data)

print("Predicted consumption:", prediction[0])
