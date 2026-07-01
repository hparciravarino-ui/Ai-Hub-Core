import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google Gen AI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "10mb" }));

// Backend API Endpoints
// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Interactive AI Assistant Chat
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, history = [], systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it to Settings > Secrets.",
      });
    }

    // Prepare system instructions for AI Hub Community Assistant
    const defaultInstruction = 
      "You are the senior AI Hub Advisor, an expert in running local LLMs and AI models (such as Llama-3, Phi-4, DeepSeek, Qwen, Mistral, Whisper, Stable Diffusion) on low-end and high-end consumer hardware.\n" +
      "Your role is to guide the user on running local models efficiently on their simulated hardware, explain quantization formats (GGUF, AWQ, EXL2, MLX, ONNX), diagnose performance issues, and recommend models and optimized parameter sets (threads, batch size, GPU offload layers).\n" +
      "Be professional, encouraging, practical, and focus on absolute local execution and privacy. Keep responses concise and formatted with markdown.";

    const promptText = message;
    
    // Call Gemini API using generateContent as specified in guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...(history.map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        }))),
        { role: "user", parts: [{ text: promptText }] },
      ],
      config: {
        systemInstruction: systemInstruction || defaultInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No response generated.";
    res.json({ content: reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// Dynamic Hardware Diagnostics
app.post("/api/assistant/diagnose", async (req, res) => {
  try {
    const { hardwareProfile, selectedProfile } = req.body;

    if (!hardwareProfile) {
      return res.status(400).json({ error: "Hardware profile is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        diagnostics: "### Manual Diagnostic Report\n\n- **Hardware:** Intel/AMD CPU with " + hardwareProfile.ram + "GB RAM.\n- **Recommended Profile:** Eco Mode (due to lack of specialized acceleration).\n- **Suggested Models:** Qwen-2.5-1.5B (Q4_K_M) or Phi-3-3.8B (IQ3_XS).\n- **Optimizer Tips:** Run with 4 threads, enable RAM swapping, and use llama.cpp runtime.\n\n*Note: Configure a Gemini API Key under Settings > Secrets to get automated, real-time advanced diagnostics.*"
      });
    }

    const diagnosisPrompt = `Provide a rapid diagnostic analysis for the following user computer hardware setup wishing to run local open-source AI models:
- CPU: ${hardwareProfile.cpu} (${hardwareProfile.cores} cores, ${hardwareProfile.threads} threads)
- GPU: ${hardwareProfile.gpu} (VRAM: ${hardwareProfile.vram} GB)
- RAM: ${hardwareProfile.ram} GB
- Storage: ${hardwareProfile.storageType} (Available space: ${hardwareProfile.freeSpace} GB)
- Target Profile: ${selectedProfile}

Based on this, output a short Markdown diagnostic report containing:
1. **Compatibility Status** (e.g. Green/Yellow/Red depending on RAM and GPU).
2. **Suggested Runtime** (e.g., llama.cpp for GGUF on older CPU, MLX on Apple Silicon, TensorRT on NVIDIA RTX).
3. **Optimal Model Recommendations** (specific small models that fit in their RAM, e.g., Phi-3 3.8B, Llama-3.2 1B or 3B, Qwen-2.5 1.5B/7B).
4. **Optimal Parameters** (VRAM offload layers, CPU thread count, batch size, context length).
Keep it highly technical, precise, and encouraging!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: diagnosisPrompt,
      config: {
        temperature: 0.5,
      },
    });

    res.json({ diagnostics: response.text || "Diagnostic compilation failed." });
  } catch (error: any) {
    console.error("Diagnostics Error:", error);
    res.status(500).json({ error: error?.message || "Diagnostics compilation failed." });
  }
});

// Setup Vite Dev Middleware or Static File Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Hub Community running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
