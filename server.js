import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the root directory (index.html, etc.)
app.use(express.static(__dirname));

// Your /generate API route
app.post("/generate", async (req, res) => {
  // ... your existing /generate code here (no changes needed) ...
});

// Catch-all route: Serve index.html for any unknown routes (important for SPA-like behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});