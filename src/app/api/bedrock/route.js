import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Helper: convert a Node.js stream to a string.
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { appliance_list, efficiency_feedback, user_location } = data;
    if (!appliance_list || !user_location) {
      return NextResponse.json(
        { error: "Missing required fields: appliance_list and/or user_location" },
        { status: 400 }
      );
    }

    // Build the prompt text as in the Python example.
    const prompt_text = `Human:
You are an energy-efficiency advisor. Suggest energy-efficient Amazon replacements for high-consumption appliances.

Input Data:
- Appliances: ${appliance_list}
- Analysis: ${efficiency_feedback}
- Location: ${user_location}

Task:
1. For appliances flagged as "high consumption," recommend 1–3 energy-efficient alternatives available on Amazon in ${user_location}.
2. For each recommendation:
   - Provide the product name and the exact Amazon URL (using the ${user_location} domain, e.g. amazon.fr).
   - Provide the price in local currency.
   - Provide the annual energy savings (in kWh and dollars based on local electricity rates).
   - Provide the payback period (in years).
3. Sort recommendations by priority (shortest payback first).
4. Add a 1-sentence tip (e.g., "Unplug devices when not in use to save 5% more energy").

Rules:
- Only include products from Amazon.
- Do not use markdown.
- If no efficient replacements exist, say "No cost-effective upgrades found for [appliance]."

\n\nAssistant:`;

    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      top_k: 250,
      stop_sequences: [],
      temperature: 0.9,
      top_p: 0.999,
      messages: [{ role: "user", content: prompt_text }]
    };

    console.log("DEBUG: Request body:", JSON.stringify(requestBody, null, 2));

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-west-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const command = new InvokeModelCommand({
      modelId: process.env.MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestBody)
    });

    const response = await client.send(command);

    let rawPayload = "";
    if (response.body) {
      rawPayload = await streamToString(response.body);
    } else {
      rawPayload = JSON.stringify(response);
    }
    console.log("DEBUG: Raw payload:", rawPayload);

    // If the raw payload starts with HTML, throw an error.
    if (rawPayload.trim().startsWith("<!DOCTYPE")) {
      throw new Error("Received unexpected HTML response from server.");
    }

    let outputJson = {};
    try {
      outputJson = JSON.parse(rawPayload);
    } catch (e) {
      outputJson = { completion: rawPayload };
    }

    // Extract text from the response.
    let completion_text = "";
    if (outputJson.content && Array.isArray(outputJson.content)) {
      const messages = outputJson.content;
      if (messages.length > 0 && messages[0].text) {
        completion_text = messages[0].text;
      }
    } else {
      completion_text = outputJson.completion || outputJson.generated_text || "";
    }

    return NextResponse.json({ model_response: completion_text });
  } catch (error) {
    console.error("Chat API error:", error);
    // Always return a JSON error, even if something unexpected happens.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
