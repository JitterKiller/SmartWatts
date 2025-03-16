import os
import json
from flask import Flask, request, jsonify
import boto3
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS


# Load environment variables from your .env.local file
load_dotenv("../../.env.local")

class EnergyAdvisorBackend:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
        self.MODEL_ID = os.getenv("MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
        self.app.add_url_rule('/chat', 'chat', self.chat_endpoint, methods=['POST'])
        

    def get_bedrock_client(self):
        session = boto3.Session(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=self.AWS_REGION
        )
        return session.client("bedrock-runtime")

    def chat_endpoint(self):
        try:
            data = request.get_json()
            appliance_list = data.get("appliance_list", "")
            efficiency_feedback = data.get("efficiency_feedback", "")
            user_location = data.get("user_location", "")

            if not appliance_list or not user_location:
                return jsonify({"error": "Missing required fields"}), 400

            # Build the prompt text.
            prompt_text = f"""Human:
You are an energy-efficiency advisor. Suggest energy-efficient Amazon replacements for high-consumption appliances.

Input Data:
- Appliances: {appliance_list}
- Analysis: {efficiency_feedback}
- Location: {user_location}

Task:
1. For appliances flagged as "high consumption," recommend 1–3 energy-efficient alternatives available on Amazon in {user_location}.
2. For each recommendation:
   - Provide the product name and the exact Amazon URL (using the {user_location} domain, e.g. amazon.fr).
   - Provide the price in local currency.
   - Provide the annual energy savings (in kWh and dollars based on local electricity rates).
   - Provide the payback period (in years).
3. Sort recommendations by priority (shortest payback first).
4. Add a 1-sentence tip (e.g., "Unplug devices when not in use to save 5% more energy").

Rules:
- Only include products from Amazon.
- Do not use markdown.
- If no efficient replacements exist, say "No cost-effective upgrades found for [appliance]."

\n\nAssistant:"""

            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 300,
                "top_k": 250,
                "stop_sequences": [],
                "temperature": 0.9,
                "top_p": 0.999,
                "messages": [
                    {"role": "user", "content": prompt_text}
                ]
            }

            print("DEBUG: Request body being sent:")
            print(json.dumps(request_body, indent=2))

            client = self.get_bedrock_client()
            response = client.invoke_model(
                modelId=self.MODEL_ID,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(request_body)
            )

            raw_payload = response["body"].read().decode("utf-8")
            print("DEBUG: Raw payload received:")
            print(raw_payload)

            try:
                output_json = json.loads(raw_payload)
            except json.JSONDecodeError:
                output_json = {"completion": raw_payload}

            if "content" in output_json and isinstance(output_json["content"], list):
                messages = output_json["content"]
                if messages and "text" in messages[0]:
                    completion_text = messages[0]["text"]
                else:
                    completion_text = ""
            else:
                completion_text = (
                    output_json.get("completion") or 
                    output_json.get("generated_text") or
                    ""
                )

            return jsonify({"model_response": completion_text}), 200

        except Exception as e:
            print("ERROR:", str(e))
            return jsonify({"error": str(e)}), 500

    def run(self):
        # Run on port 5000 to avoid conflict with Next.js (typically on 3000)
        self.app.run(host="0.0.0.0", port=5001, debug=True)

if __name__ == "__main__":
    backend = EnergyAdvisorBackend()
    backend.run()
