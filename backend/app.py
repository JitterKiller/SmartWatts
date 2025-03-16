import os
import PyPDF2
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid
import json
import os

app = Flask(__name__)
CORS(app)  # Activation CORS globale


base_dir = os.path.abspath(os.path.dirname(__file__))
PDF_FOLDER = os.path.join(base_dir, "uploads")
os.makedirs(PDF_FOLDER, exist_ok=True)


# Stockage en mémoire des contextes (utilisez une DB en production)
context_store = {}

def standardize_filename():
    return f"invoice_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}.pdf"

def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        return "".join(page.extract_text() for page in reader.pages)

@app.route('/api/upload', methods=['POST'])
def handle_pdf_upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Aucun fichier uploadé"}), 400

        file = request.files['file']
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "Format PDF requis"}), 400

        # Sauvegarde standardisée
        filename = standardize_filename()
        file_path = os.path.join(PDF_FOLDER, filename)
        file.save(file_path)

        # Extraction texte
        invoice_text = extract_text_from_pdf(file_path)
        
        # Stockage contexte
        context_store[filename] = invoice_text
        
        # Envoi initial à Bedrock pour préprocessing
        bedrock = boto3.client('bedrock-runtime')
        prompt = f"""Facture électrique:
        {invoice_text}
        
        Tâche: Préparer un résumé contextuel pour analyse future."""
        
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-sonnet-20240229-v1:0",
            body=json.dumps({"prompt": prompt})
        )
        
        return jsonify({
            "filename": filename,
            "preprocessing": response['body'].read().decode()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def handle_chat():
    try:
        data = request.get_json()
        filename = data.get('filename')
        message = data.get('message')

        if not filename or filename not in context_store:
            return jsonify({"error": "Contexte invalide"}), 400

        # Construction prompt avec contexte
        prompt = f"""Contexte facture:
        {context_store[filename]}
        
        Utilisateur: {message}
        Assistant:"""
        
        bedrock = boto3.client('bedrock-runtime')
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-sonnet-20240229-v1:0",
            body=json.dumps({"prompt": prompt})
        )

        return jsonify({
            "response": response['body'].read().decode()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)