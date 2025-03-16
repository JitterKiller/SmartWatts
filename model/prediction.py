import sys
import joblib
import numpy as np

# ✅ Load the trained model
model = joblib.load("./model/energy_model.pkl")

# ✅ Read input from command line arguments
try:
    input_data = np.array([list(map(float, sys.argv[1:]))])  # Convert args to float
except Exception as e:
    print(f"Error processing input: {e}")
    sys.exit(1)

# ✅ Make prediction
prediction = model.predict(input_data)

# ✅ Print the result (so Node.js can capture it)
print(prediction[0])
