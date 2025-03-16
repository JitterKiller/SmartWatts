import os
import uuid
import json
import sqlite3
from datetime import datetime
import PyPDF2
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration and paths
AWS_REGION = "us-west-2"
MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PDF_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(PDF_FOLDER, exist_ok=True)

# Initialize SQLite DB for storing invoice contexts
DB_PATH = os.path.join(BASE_DIR, "context_store.db")
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS invoice_context (
        filename TEXT PRIMARY KEY,
        context TEXT
    )
''')
conn.commit()

def standardize_filename():
    return f"invoice_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}.pdf"

def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        return "".join(page.extract_text() for page in reader.pages)

def build_request_body(prompt_text):
    return {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "top_k": 250,
        "stop_sequences": [],
        "temperature": 0.9,
        "top_p": 0.999,
        "messages": [{"role": "user", "content": prompt_text}]
    }

# ------------------------------------------------------------------------------
# Invoice Upload Endpoint
# ------------------------------------------------------------------------------
@app.route('/api/upload', methods=['POST'])
def handle_upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "PDF format required"}), 400

        filename = standardize_filename()
        file_path = os.path.join(PDF_FOLDER, filename)
        file.save(file_path)

        # Extract text from the PDF
        invoice_text = extract_text_from_pdf(file_path)
        form_data = request.form.to_dict()

        # Store the invoice text in the local SQLite database
        cursor.execute(
            "INSERT INTO invoice_context (filename, context) VALUES (?, ?)",
            (filename, invoice_text)
        )
        conn.commit()

        # Build prompt for Bedrock matching energy advisor parameters
        prompt_text = f"""Invoice Text:
{invoice_text}

Additional Data:
{json.dumps(form_data, indent=2)}

Task: Prepare a contextual summary to assist with analysis.

Assistant:"""

        request_body = build_request_body(prompt_text)

        bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION)
        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )

        result = response['body'].read().decode("utf-8")
        return jsonify({"filename": filename, "result": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------------------------------------------
# Invoice Chat Endpoint
# ------------------------------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
def handle_chat():
    try:
        data = request.get_json()
        filename = data.get('filename')
        message = data.get('message')

        # Retrieve invoice context from the SQLite database
        cursor.execute("SELECT context FROM invoice_context WHERE filename=?", (filename,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Invalid context"}), 400

        invoice_context = row[0]
        prompt_text = f"""Invoice Context:
{invoice_context}

User: {message}
Assistant:"""

        request_body = build_request_body(prompt_text)

        bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION)
        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )

        result = response['body'].read().decode("utf-8")
        return jsonify({"response": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
