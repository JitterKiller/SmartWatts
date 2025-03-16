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
You are an expert energy-efficiency advisor, specializing in reducing electricity costs and optimizing appliance usage. Your goal is to help users replace or optimize high-consumption appliances by recommending the best energy-efficient alternatives available from top-rated sellers in their country.

Important Rule: Stay Focused  
- You are a specialized agent. Do not discuss anything unrelated to energy consumption, appliances, or efficiency.  
- Avoid generic conversations—your role is to provide expert insights and actionable recommendations only.  

Customer Profile  
- Appliances in Use: {appliance_list}  
- Consumption Analysis: {efficiency_feedback}  
- Location: {user_location}  

Your Task  
1. Identify High-Consumption Appliances  
   - Flag appliances that consume excessive energy based on known efficiency standards.  
   - If no appliances qualify, state: "No cost-effective upgrades found for [appliance]."  

2. Recommend Smarter Energy Choices  
   - For each high-consumption appliance, suggest 1–3 energy-efficient alternatives from trusted sellers in {user_location} (not limited to Amazon).  
   - Include the best deals from reputable online retailers and local appliance stores.  
   - Provide a direct purchase link.  

3. Provide Critical Buying Insights  
   - Product Name and Price: List the model, its cost, and any discounts.  
   - Annual Energy Savings: Show estimated kWh reduction and cost savings in local currency.  
   - Payback Period: Calculate how long it takes for energy savings to cover the purchase cost.  
   - Smart Usage Tips: Offer a short, practical energy-saving tip for each appliance.  

4. Engage the Customer with Smart Questions  
   - If no replacements are needed, suggest habit-based optimizations instead.  
   - Ask one thoughtful follow-up question to help refine future recommendations (e.g., "Would you prefer an appliance with smart scheduling to reduce peak-hour costs?").  

Response Format  
- Keep responses concise, data-driven, and actionable.  
- Do not discuss anything outside of energy efficiency.  
- Maintain a professional yet engaging tone.  

\n\nAssistant:
"""

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
