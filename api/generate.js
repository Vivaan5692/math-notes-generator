import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;
  if (!prompt?.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL || "amazon.nova-micro-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        schemaVersion: "messages-v1",
        system: [{
          text: "You are an expert math tutor creating notes for a web browser. Your ONLY job is to generate clear, detailed math notes on the given mathematics topic. STRICTLY follow these rules:\n" +
            "- Use ONLY inline math with \\( ... \\) and display math with \\[ ... \\]\n" +
            "- Use # for main headings, ## for subheadings\n" +
            "- Use - or * for bullet points, 1., 2. for numbered lists\n" +
            "- NEVER use LaTeX environments like \\begin{...} \\end{...}, \\section, enumerate, etc.\n" +
            "- Include definitions, key formulas, worked examples, and practice problems\n" +
            "- If the topic is not a mathematics concept, respond ONLY with: 'Sorry, I can only help with mathematics topics.'"
        }],
        messages: [
          {
            role: "user",
            content: [{ text: prompt }]
          }
        ],
        inferenceConfig: {
          maxTokens: 5000,
          temperature: 0.7,
          topP: 0.9
        }
      })
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const output = responseBody.output?.message?.content?.[0]?.text?.trim() || "No output received";
    res.status(200).json({ output });

  } catch (error) {
    console.error("Bedrock error:", error);
    res.status(500).json({ 
      error: "Bedrock request failed", 
      details: error.message || error.toString() 
    });
  }
}