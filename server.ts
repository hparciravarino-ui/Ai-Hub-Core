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
  const customGeminiKey = req.headers["x-gemini-key"] as string | undefined;
  const customOpenRouterKey = req.headers["x-openrouter-key"] as string | undefined;

  const isKeyConfigured = !!(customGeminiKey || process.env.GEMINI_API_KEY);
  const isOpenRouterConfigured = !!(customOpenRouterKey || process.env.OPENROUTER_API_KEY);
  
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    apiConfigured: isKeyConfigured,
    openRouterConfigured: isOpenRouterConfigured
  });
});

// Keys Validation Endpoint
app.post("/api/keys/validate", async (req, res) => {
  const { provider, key } = req.body;
  if (!provider || !key) return res.status(400).json({ error: "Missing provider or key" });

  try {
    if (provider === "gemini") {
      const testAi = new GoogleGenAI({ apiKey: key });
      await testAi.models.generateContent({ model: "gemini-3.5-flash", contents: "test", config: { maxOutputTokens: 1 } });
      return res.json({ valid: true });
    } else if (provider === "openrouter") {
      const origin = req.headers.origin || req.get("referer") || "https://ai.studio/build";
      const orRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { 
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": origin,
          "X-Title": "AI Hub Simulator"
        }
      });
      if (orRes.ok) {
        return res.json({ valid: true });
      } else {
        const errorText = await orRes.text().catch(() => "Unknown error");
        return res.json({ valid: false, error: `OpenRouter error: ${orRes.status} ${orRes.statusText} - ${errorText}` });
      }
    } else {
      return res.status(400).json({ error: "Invalid provider" });
    }
  } catch (error: any) {
    return res.json({ valid: false, error: error.message });
  }
});

// Interactive AI Assistant Chat
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, history = [], systemInstruction, modelId } = req.body;
    
    const customGeminiKey = req.headers["x-gemini-key"] as string | undefined;
    const customOpenRouterKey = req.headers["x-openrouter-key"] as string | undefined;
    const activeGeminiKey = customGeminiKey || process.env.GEMINI_API_KEY;
    const activeOpenRouterKey = customOpenRouterKey || process.env.OPENROUTER_API_KEY;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const defaultInstruction = 
      "You are the senior AI Hub Advisor, an expert in running local LLMs and AI models (such as Llama-3, Phi-4, DeepSeek, Qwen, Mistral, Whisper, Stable Diffusion) on low-end and high-end consumer hardware.\n" +
      "Your role is to guide the user on running local models efficiently on their simulated hardware, explain quantization formats (GGUF, AWQ, EXL2, MLX, ONNX), diagnose performance issues, and recommend models and optimized parameter sets (threads, batch size, GPU offload layers).\n" +
      "Be professional, encouraging, practical, and focus on absolute local execution and privacy. Keep responses concise and formatted with markdown.";

    const promptText = message;

    // Use OpenRouter if modelId points to an online open source model
    if (modelId && modelId.includes("/")) {
      if (!activeOpenRouterKey) {
         return res.status(500).json({ error: "Per eseguire veri modelli AI open-source online (es. Llama, Qwen, DeepSeek), devi configurare la tua OPENROUTER_API_KEY." });
      }

      // Format messages for OpenRouter
      const messages = [
        { role: "system", content: systemInstruction || defaultInstruction },
        ...(history.map((h: any) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content
        }))),
        { role: "user", content: promptText }
      ];

      const origin = req.headers.origin || req.get("referer") || "https://ai.studio/build";
      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeOpenRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin,
          "X-Title": "AI Hub Simulator"
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages
        })
      });

      if (!orRes.ok) {
        let errJson;
        try { errJson = await orRes.json(); } catch(e) {}
        throw new Error(errJson?.error?.message || "Errore di connessione API OpenRouter.");
      }

      const orData = await orRes.json();
      const reply = orData.choices?.[0]?.message?.content || "Nessuna risposta dal modello.";
      return res.json({ content: reply });
    }

    if (!activeGeminiKey) {
      return res.status(500).json({
        error: "Chiave GEMINI API non configurata.",
      });
    }

    // Initialize custom AI client if custom key provided, else use global ai
    const currentAi = customGeminiKey ? new GoogleGenAI({ apiKey: activeGeminiKey }) : ai;

    // Call Gemini API using generateContent as specified in guidelines
    const response = await currentAi.models.generateContent({
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
    const customGeminiKey = req.headers["x-gemini-key"] as string | undefined;
    const activeGeminiKey = customGeminiKey || process.env.GEMINI_API_KEY;

    if (!hardwareProfile) {
      return res.status(400).json({ error: "Hardware profile is required" });
    }

    if (!activeGeminiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY non configurata." });
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

    const currentAi = customGeminiKey ? new GoogleGenAI({ apiKey: activeGeminiKey }) : ai;

    const response = await currentAi.models.generateContent({
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

// Search Open-Source AI Models Online with OpenRouter API
app.post("/api/models/search-online", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const orRes = await fetch("https://openrouter.ai/api/v1/models");
    if (!orRes.ok) {
      throw new Error("Impossibile recuperare i modelli open source da OpenRouter.");
    }
    
    const orData = await orRes.json();
    const allModels = orData.data || [];
    
    const lowerQuery = query.toLowerCase();
    const searchResults = allModels.filter((m: any) => 
      m.id.toLowerCase().includes(lowerQuery) || 
      (m.name && m.name.toLowerCase().includes(lowerQuery))
    ).slice(0, 10);

    const mappedModels = searchResults.map((m: any) => {
      let category = "Chat";
      const idLower = m.id.toLowerCase();
      if (idLower.includes("coder") || idLower.includes("code")) category = "Coding";
      if (idLower.includes("vision") || idLower.includes("vl")) category = "ImageGen";

      return {
        id: m.id,
        name: m.name || m.id.split("/").pop(),
        category: category,
        size: m.context_length ? `${Math.round(m.context_length / 1000)}k Context` : "Cloud API",
        quant: "API Endpoint",
        ramRequired: 0,
        vramRequired: 0,
        estimatedSpeed: 80,
        description: m.description ? (m.description.slice(0, 150) + "...") : "Modello open source online ospitato su infrastruttura remota API.",
        rating: 4.8,
        format: "API",
        digitalSignature: m.id.split("/")[0] || "Open Source",
        sha256: "Cloud Node",
        version: "Latest",
        sourceUrl: `https://openrouter.ai/models/${m.id}`
      };
    });

    const citations = [
      { title: "OpenRouter Models List", url: "https://openrouter.ai/models" }
    ];

    res.json({ models: mappedModels, citations });
  } catch (error: any) {
    console.error("Search Online Models Error:", error);
    res.status(500).json({ error: error?.message || "Errore nella ricerca online dei modelli." });
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
