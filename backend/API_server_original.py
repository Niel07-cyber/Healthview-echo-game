from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import joblib
import os
import csv
import json
from datetime import datetime

app = Flask(__name__, static_folder="../public", static_url_path="")
CORS(app)

# Load ML model and encoder (with fallback if files don't exist)
try:
    model = joblib.load("lightgbm_model.pkl")
    encoder = joblib.load("label_encoder.pkl")
    print("ML model and encoder loaded successfully")
except Exception as e:
    print(f"Warning: Could not load ML model: {e}")
    model = None
    encoder = None

RESULTS_FILE_CSV = "results.csv"

# Function to write results to CSV
def write_results_to_csv(results):
    try:
        file_exists = os.path.isfile(RESULTS_FILE_CSV)
        with open(RESULTS_FILE_CSV, mode='a', newline='') as file:
            fieldnames = ['userID', 'score', 'ai_score', 'total', 'timestamp']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerow(results)
        print("Result saved:", results)
    except Exception as e:
        print("Error saving results to CSV:", e)

# === ROUTES ===

@app.route("/api/questions", methods=["GET"])
def get_questions():
    try:
        # Try to load from CSV first (original behavior)
        if os.path.exists("FileList.csv"):
            df = pd.read_csv("FileList.csv")
            df = df[pd.to_numeric(df["EF"], errors="coerce").notnull()]
            sampled = df.sample(n=min(15, len(df)))

            def get_label_from_value(ef):
                ef = float(ef)
                if ef >= 55:
                    return "Normal"
                elif 40 <= ef < 55:
                    return "Reduced"
                else:
                    return "Abnormal"

            questions = []
            for _, row in sampled.iterrows():
                filename = f"{row['FileName']}.mp4"
                video_url = f"http://127.0.0.1:5000/videos/{filename}"
                questions.append({
                    "question": "What is the most likely EF value for this heart?",
                    "answers": ["Normal", "Reduced", "Abnormal"],
                    "correct": get_label_from_value(row["EF"]),
                    "videoUrl": video_url,
                    "metadata": {
                        "ESV": row["ESV"],
                        "EDV": row["EDV"],
                        "FrameHeight": row["FrameHeight"],
                        "FrameWidth": row["FrameWidth"],
                        "FPS": row["FPS"],
                        "NumberOfFrames": row["NumberOfFrames"]
                    }
                })
            return jsonify(questions)
        else:
            # Fallback to static questions if CSV doesn't exist
            with open("quiz_question.json", "r", encoding="utf-8") as f:
                questions = json.load(f)
            return jsonify(questions)
    except Exception as e:
        print(f"Error loading questions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/videos/<path:filename>")
def serve_video(filename):
    video_dir = os.path.join(os.path.dirname(__file__), "..", "public", "mp4")
    if not os.path.exists(video_dir):
        # Try original location
        video_dir = os.path.join(os.path.dirname(__file__), "mp4")
    return send_from_directory(video_dir, filename)

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        
        if model and encoder:
            features = [
                float(data["ESV"]),
                float(data["EDV"]),
                float(data["FrameHeight"]),
                float(data["FrameWidth"]),
                float(data["FPS"]),
                float(data["NumberOfFrames"]),
            ]
            prediction = model.predict([features])[0]
            label = encoder.inverse_transform([prediction])[0]
            return jsonify({"prediction": label})
        else:
            # Fallback prediction logic matching original categorization
            esv = float(data["ESV"])
            edv = float(data["EDV"])
            ef = ((edv - esv) / edv) * 100 if edv > 0 else 50
            
            if ef >= 55:
                label = "Normal"
            elif ef >= 40:
                label = "Reduced"
            else:
                label = "Abnormal"
            
            return jsonify({"prediction": label})
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 400

@app.route("/api/submit_results", methods=["POST"])
def submit_results():
    try:
        data = request.get_json()
        print("Received result submission:", data)

        # Extract fields
        result = {
            'userID': data.get("userID", "unknown"),
            'score': data.get("score"),
            'ai_score': data.get("ai_score"),
            'total': data.get("total"),
            'timestamp': data.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # Check required fields
        if None in result.values() or "" in result.values():
            return jsonify({"error": "Missing required fields"}), 400

        # Save to CSV
        write_results_to_csv(result)
        return jsonify({"status": "saved"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return "Health Echo Quiz API Server"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
