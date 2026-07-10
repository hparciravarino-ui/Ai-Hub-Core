import { getAuthHeaders } from "./utils";

const defaultInstruction = "You are the senior AI Hub Advisor, an expert in running local LLMs and AI models (such as Llama-3, Phi-4, DeepSeek, Qwen, Mistral, Whisper, Stable Diffusion) on low-end and high-end consumer hardware.\n" +
   "Your role is to guide the user on running local models efficiently on their simulated hardware, explain quantization formats (GGUF, AWQ, EXL2, MLX, ONNX), diagnose performance issues, and recommend models and optimized parameter sets (threads, batch size, GPU offload layers).\n" +
   "Be professional, encouraging, practical, and focus on absolute local execution and privacy. Keep responses concise and formatted with markdown.";

export async function chatAPI(message: string, history: any[], systemInstruction?: string, modelId?: string) {
  const headers = getAuthHeaders();
  const activeOpenRouterKey = headers["x-openrouter-key"];
  const activeGeminiKey = headers["x-gemini-key"];
  const activeOpenaiKey = headers["x-openai-key"];
  const activeAnthropicKey = headers["x-anthropic-key"];
  const activeGroqKey = headers["x-groq-key"];

  const messages = [
    { role: "system", content: systemInstruction || defaultInstruction },
    ...history.map((h: any) => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content
    })),
    { role: "user", content: message }
  ];

  let targetModel = modelId || "";

  // Mapping generic IDs to specific models
  if (!targetModel.includes("/")) {
      if (targetModel === "llama_3_2_3b") targetModel = "meta-llama/llama-3.2-3b-instruct";
      else if (targetModel === "deepseek_r1_1_5b") targetModel = "deepseek/deepseek-r1-distill-qwen-1.5b";
      else if (targetModel === "qwen_2_5_coder_1_5b") targetModel = "qwen/qwen-2.5-coder-32b-instruct";
      else if (targetModel === "mistral_7b_instruct") targetModel = "mistralai/mistral-7b-instruct:free";
      else targetModel = "google/gemini-2.0-flash-lite-preview-02-05:free";
  }

  // 1. OpenAI Native
  if (targetModel.startsWith("openai/") && activeOpenaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${activeOpenaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: targetModel.replace("openai/", ""), messages })
    });
    if (!res.ok) throw new Error("Errore OpenAI API");
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // 2. Anthropic Native
  if (targetModel.startsWith("anthropic/") && activeAnthropicKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": activeAnthropicKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: targetModel.replace("anthropic/", ""),
        system: systemInstruction || defaultInstruction,
        messages: [
          ...history.map((h: any) => ({ role: h.role === "assistant" ? "assistant" : "user", content: h.content })),
          { role: "user", content: message }
        ],
        max_tokens: 1024
      })
    });
    if (!res.ok) throw new Error("Errore Anthropic API");
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }

  // 3. Groq Native (OpenAI compatible)
  if (targetModel.startsWith("groq/") && activeGroqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${activeGroqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: targetModel.replace("groq/", ""), messages })
    });
    if (!res.ok) throw new Error("Errore Groq API");
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // 4. OpenRouter fallback for everything else if available
  if (activeOpenRouterKey && (targetModel.includes("/") || !activeGeminiKey)) {
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

  // 5. Gemini API Backup
  if (!activeGeminiKey) {
    throw new Error("Nessuna chiave API configurata o il provider per il modello scelto non ha una chiave (controlla il menu Sicurezza).");
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
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
  const headers = getAuthHeaders();
  
  let allModels: any[] = [];
  
  // Static additions for direct APIs
  if (headers["x-openai-key"]) {
    allModels.push(
      { id: "openai/gpt-4o", name: "GPT-4o (OpenAI)", context_length: 128000, description: "Modello OpenAI ad alte prestazioni." },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (OpenAI)", context_length: 128000, description: "Modello OpenAI veloce e compatto." }
    );
  }
  if (headers["x-anthropic-key"]) {
    allModels.push(
      { id: "anthropic/claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", context_length: 200000, description: "Modello avanzato di Anthropic." },
      { id: "anthropic/claude-3-haiku-20240307", name: "Claude 3 Haiku", context_length: 200000, description: "Modello veloce di Anthropic." }
    );
  }
  if (headers["x-groq-key"]) {
    allModels.push(
      { id: "groq/llama-3.3-70b-versatile", name: "Llama 3.3 70B (Groq)", context_length: 128000, description: "Llama 3.3 veloce tramite LPU." },
      { id: "groq/mixtral-8x7b-32768", name: "Mixtral 8x7b (Groq)", context_length: 32768, description: "Modello MoE veloce su Groq." }
    );
  }

  try {
    const orRes = await fetch("https://openrouter.ai/api/v1/models");
    if (orRes.ok) {
        const orData = await orRes.json();
        allModels = [...allModels, ...(orData.data || [])];
    }
  } catch (e) {
    console.warn("OpenRouter fetch failed", e);
  }

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
      sourceUrl: m.id.includes("/") && !m.id.startsWith("openai/") && !m.id.startsWith("anthropic/") && !m.id.startsWith("groq/") 
        ? `https://openrouter.ai/models/${m.id}` 
        : "#"
    };
  });
  
  return { models: mappedModels, citations: [{ title: "Provider APIs", url: "#" }] };
}

export async function huggingfaceGenerateAPI(type: "image" | "video" | "audio", prompt: string, modelId?: string) {
  const headers = getAuthHeaders();
  const hfKey = headers["x-huggingface-key"];

  if (!hfKey) {
    throw new Error("Per questa funzionalità è richiesta una Hugging Face API Key. Inseriscila nel menu Sicurezza.");
  }

  let modelEndpoint = "";
  const mappedModel = modelId || "";

  if (mappedModel === "flux-1-schnell") {
    modelEndpoint = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";
  } else if (mappedModel === "sd-3.5-large") {
    modelEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";
  } else if (mappedModel === "text-to-video-ms-1.7b") {
    modelEndpoint = "https://api-inference.huggingface.co/models/ali-vilab/text-to-video-ms-1.7b";
  } else if (mappedModel === "cogvideox-5b") {
    modelEndpoint = "https://api-inference.huggingface.co/models/THUDM/CogVideoX-5b";
  } else if (mappedModel === "stable-audio-open") {
    modelEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-audio-open-1.0";
  } else if (mappedModel === "audioldm-2") {
    modelEndpoint = "https://api-inference.huggingface.co/models/cvssp/audioldm2";
  } else {
    if (type === "image") {
      modelEndpoint = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";
    } else if (type === "audio") {
      modelEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-audio-open-1.0";
    } else if (type === "video") {
      modelEndpoint = "https://api-inference.huggingface.co/models/ali-vilab/text-to-video-ms-1.7b";
    }
  }

  let retries = 3;
  while (retries > 0) {
    const response = await fetch(modelEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.error && errJson.error.includes("is currently loading")) {
          // Wait and retry
          await new Promise(r => setTimeout(r, 5000));
          retries--;
          continue;
        }
        throw new Error(`Errore Hugging Face: ${errJson.error || errorText}`);
      } catch (e: any) {
        throw new Error(`Errore Hugging Face API: ${e.message || errorText}`);
      }
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  throw new Error("Timeout durante il caricamento del modello su Hugging Face.");
}
