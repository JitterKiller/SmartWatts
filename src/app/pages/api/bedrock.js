import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import dotenv from "dotenv";

dotenv.config();

// AWS Bedrock Agent Configuration
const client = new BedrockAgentRuntimeClient({
  region: "us-west-2",  // Change if needed
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const { userMessage } = await req.json();

    const command = new InvokeAgentCommand({
      agentId: "HN5KQAYAH4",  
      sessionId: "test-session",
      inputText: userMessage,
    });

    const response = await client.send(command);
    const responseData = await response.outputText;

    return new Response(JSON.stringify({ response: responseData }), { status: 200 });
  } catch (error) {
    console.error("Bedrock Agent Error:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to Bedrock Agent" }), { status: 500 });
  }
}
