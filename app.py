import torch
from transformers import BertTokenizer, BertForSequenceClassification
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import sys

# --- 1. INITIALIZE FLASK APP ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- 2. LOAD MODEL (Done ONCE at startup) ---
MODEL_PATH = "./model/discharge_readmission"
tokenizer = None
model = None

try:
    print(f"Loading tokenizer from: {MODEL_PATH}")
    tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
    
    print(f"Loading model from: {MODEL_PATH}")
    model = BertForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=1)
    
    model.eval() # Set model to evaluation mode
    print("✅ Model loaded successfully.")

except Exception as e:
    print(f"❌ Error loading model: {e}")
    sys.exit(1)

# --- 3. DEFINE THE PREDICTION API ROUTE ---
@app.route('/predict', methods=['POST'])
def predict_readmission():
    try:
        # Get the note from the request
        data = request.get_json()
        test_note = data.get('note')

        if not test_note:
            return jsonify({"error": "No 'note' text provided"}), 400

        # --- 4. PREPARE & RUN PREDICTION (Same as your script) ---
        inputs = tokenizer(
            test_note,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        )

        with torch.no_grad():
            outputs = model(**inputs)
            logit_score = outputs.logits[0].item()
            probability = torch.sigmoid(torch.tensor(logit_score)).item()

        # Determine the label
        label = "High Risk" if probability > 0.5 else "Low Risk"

        # --- 5. SEND THE RESULT BACK AS JSON ---
        return jsonify({
            "probability": probability,
            "label": label,
            "logit_score": logit_score
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": "Internal server error"}), 500

# --- 6. RUN THE APP ---
if __name__ == '__main__':
    print("Starting Flask API server at http://localhost:5000")
    app.run(port=5000, debug=True)