import { getAuthHeaders } from "./utils";

const defaultInstruction = "You are the senior AI Hub Advisor, an expert in running local LLMs and AI models (such as Llama-3, Phi-4, DeepSeek, Qwen, Mistral, Whisper, Stable Diffusion) on low-end and high-end consumer hardware.\n" +
   "Your role is to guide the user on running local models efficiently on their simulated hardware, explain quantization formats (GGUF, AWQ, EXL2, MLX, ONNX), diagnose performance issues, and recommend models and optimized parameter sets (threads, batch size, GPU offload layers).\n" +
   "Be professional, encouraging, practical, and focus on absolute local execution and privacy. Keep responses concise and formatted with markdown.";

export async function chatAPI(message: string, history: any[], systemInstruction?: string, modelId?: string) {
  const headers = getAuthHeaders();
  const activeOpenRouterKey = headers["x-openrouter-key"];
  const activeGeminiKey = headers["x-gemini-key"];

  if ((modelId && modelId.includes("/")) || (!activeGeminiKey && activeOpenRouterKey) || (modelId && activeOpenRouterKey)) {
    if (!activeOpenRouterKey) {
      throw new Error("Per eseguire modelli AI open-source online, devi configurare la tua OPENROUTER_API_KEY nel menu Sicurezza.");
    }
    const messages = [
      { role: "system", content: systemInstruction || defaultInstruction },
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content
      })),
      { role: "user", content: message }
    ];

    let targetModel = modelId;
    if (!targetModel || !targetModel.includes("/")) {
        if (targetModel === "llama_3_2_3b") targetModel = "meta-llama/llama-3.2-3b-instruct";
        else if (targetModel === "deepseek_r1_1_5b") targetModel = "deepseek/deepseek-r1-distill-qwen-1.5b";
        else if (targetModel === "qwen_2_5_coder_1_5b") targetModel = "qwen/qwen-2.5-coder-32b-instruct";
        else if (targetModel === "mistral_7b_instruct") targetModel = "mistralai/mistral-7b-instruct:free";
        else targetModel = "google/gemini-2.0-flash-lite-preview-02-05:free";
    }

    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${activeOpenRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Hub Simulator"
      },
      body: JSON.stringify({
        model: targetModel,
        messages: messages
      })
    });
    if (!orRes.ok) {
      let errJson;
      try { errJson = await orRes.json(); } catch(e) {}
      throw new Error(errJson?.error?.message || "Errore di connessione API OpenRouter.");
    }
    const orData = await orRes.json();
    return orData.choices?.[0]?.message?.content || "Nessuna risposta dal modello.";
  }

  if (!activeGeminiKey) {
    throw new Error("Chiave API non configurata. Inserisci una chiave GEMINI o OPENROUTER nel menu Sicurezza.");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeGeminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       systemInstruction: { parts: [{ text: systemInstruction || defaultInstruction }] },
       contents: [
         ...history.map((h: any) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }]
         })),
         { role: "user", parts: [{ text: message }] }
       ]
    })
  });

  if (!response.ok) {
    let errJson;
    try { errJson = await response.json(); } catch(e) {}
    throw new Error(errJson?.error?.message || "Errore di connessione API Gemini.");
  }
  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  return reply;
}

export async function diagnoseAPI(hardwareProfile: any, selectedProfile: string) {
  const headers = getAuthHeaders();
  const activeGeminiKey = headers["x-gemini-key"];
  const activeOpenRouterKey = headers["x-openrouter-key"];
  
  if (!hardwareProfile) throw new Error("Hardware profile is required");
  
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

  if (!activeGeminiKey && activeOpenRouterKey) {
    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${activeOpenRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Hub Simulator"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [{ role: "user", content: diagnosisPrompt }]
      })
    });
    if (!orRes.ok) throw new Error("Diagnostics compilation failed via OpenRouter.");
    const orData = await orRes.json();
    return orData.choices?.[0]?.message?.content || "Diagnostic compilation failed.";
  }

  if (!activeGeminiKey) throw new Error("Chiave API non configurata nel menu Sicurezza.");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeGeminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       contents: [
         { role: "user", parts: [{ text: diagnosisPrompt }] }
       ]
    })
  });

  if (!response.ok) {
    let errJson;
    try { errJson = await response.json(); } catch(e) {}
    throw new Error(errJson?.error?.message || "Diagnostics compilation failed.");
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Diagnostic compilation failed.";
}

export async function searchModelsAPI(query: string) {
  if (!query) throw new Error("Query parameter is required");
  const orRes = await fetch("https://openrouter.ai/api/v1/models");
  if (!orRes.ok) throw new Error("Impossibile recuperare i modelli open source da OpenRouter.");
  
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
  
  return { models: mappedModels, citations: [{ title: "OpenRouter Models List", url: "https://openrouter.ai/models" }] };
}
