import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (index.html) from the root directory
app.use(express.static(__dirname));

// Your Bedrock generation endpoint
app.post("/generate", async (req, res) => {
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
            "- Include definitions, formulas, examples, and practice problems\n" +
            "- If the topic is not mathematics, respond ONLY with: 'Sorry, I can only help with mathematics topics.'"
        }],
        messages: [
          {
            role: "user",
            content: [{ text: prompt }]
          }
        ],
        inferenceConfig: {
          maxTokens: 2500,
          temperature: 0.7,
          topP: 0.9
        }
      })
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const output = responseBody.output?.message?.content?.[0]?.text?.trim() || "No output received";
    res.json({ output });

  } catch (error) {
    console.error("Bedrock error:", error);
    res.status(500).json({
      error: "Bedrock request failed",
      details: error.message || error.toString()
    });
  }
});

// Fallback: Serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});