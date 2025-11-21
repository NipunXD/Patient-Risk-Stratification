import torch
from transformers import BertTokenizer, BertForSequenceClassification
import sys

# --- 1. CONFIGURATION ---
MODEL_PATH = "./model/discharge_readmission" 

# --- 2. LOAD THE MODEL AND TOKENIZER (Done ONCE) ---
try:
    print(f"Loading tokenizer from: {MODEL_PATH}")
    tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
    
    print(f"Loading model from: {MODEL_PATH}")
    # We explicitly tell it num_labels=1 to match the saved model
    model = BertForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=1)
    
    # Set the model to evaluation mode (disables dropout, etc.)
    model.eval()
    print("✅ Model loaded successfully. Ready to predict.")
    print("==================================================")

except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("Please make sure the MODEL_PATH is correct and contains:")
    print("  - config.json (or bert_config.json)")
    print("  - pytorch_model.bin")
    print("  - vocab.txt")
    sys.exit(1)


# --- 3. INTERACTIVE PREDICTION LOOP ---
while True:
    print("\nPaste your clinical note below (press Enter twice to submit):")
    
    # Read multi-line input from the user
    lines = []
    while True:
        line = input()
        if not line:
            break
        lines.append(line)
    
    test_note = "\n".join(lines)

    # If the user just hits enter, quit the program
    if not test_note.strip():
        print("No input received. Exiting.")
        break

    # --- 4. PREPARE THE INPUT ---
    print("\nTokenizing note...")
    inputs = tokenizer(
        test_note,
        return_tensors="pt",  # Return PyTorch tensors
        truncation=True,      # Truncate to max length
        padding=True,         # Pad to max length
        max_length=512        # The max_length from the original command
    )

    # --- 5. RUN THE PREDICTION ---
    print("Running prediction...")
    with torch.no_grad(): # Disable gradient calculations
        outputs = model(**inputs)
        
        # The model with num_labels=1 outputs logits
        logit_score = outputs.logits[0].item()
        
        # Apply a Sigmoid function to convert the logit to a probability
        probability = torch.sigmoid(torch.tensor(logit_score)).item()


    # --- 6. SHOW THE RESULTS ---
    print("\n--- 📈 Prediction Results ---")
    print(f"Note: '{test_note[:100].strip()}...'")
    print(f"\nRaw Logit Score: {logit_score:.4f}")
    print(f"Risk Probability: {probability:.4f} ({(probability * 100):.2f}%)")

    # Use a standard 0.5 threshold to decide the label
    if probability > 0.5:
        print("Prediction: 🔴 High Risk (Readmission)")
    else:
        print("Prediction: 💚 Low Risk (No Readmission)")
    print("==================================================")