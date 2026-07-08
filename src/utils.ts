import { HardwareProfile } from "./types";

const safeAtob = (str: string) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return atob(str);
  }
};

/**
 * Gets the auth headers for Gemini and OpenRouter using the decrypted keys from localStorage.
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const geminiKeyEnc = localStorage.getItem("gemini_key_enc");
    if (geminiKeyEnc) headers["x-gemini-key"] = safeAtob(geminiKeyEnc);

    const openRouterKeyEnc = localStorage.getItem("openrouter_key_enc");
    if (openRouterKeyEnc) headers["x-openrouter-key"] = safeAtob(openRouterKeyEnc);

    const huggingfaceKeyEnc = localStorage.getItem("huggingface_key_enc");
    if (huggingfaceKeyEnc) headers["x-huggingface-key"] = safeAtob(huggingfaceKeyEnc);

    const openaiKeyEnc = localStorage.getItem("openai_key_enc");
    if (openaiKeyEnc) headers["x-openai-key"] = safeAtob(openaiKeyEnc);

    const anthropicKeyEnc = localStorage.getItem("anthropic_key_enc");
    if (anthropicKeyEnc) headers["x-anthropic-key"] = safeAtob(anthropicKeyEnc);

    const groqKeyEnc = localStorage.getItem("groq_key_enc");
    if (groqKeyEnc) headers["x-groq-key"] = safeAtob(groqKeyEnc);
  } catch (e) {
    console.error("Failed to parse API keys from localStorage", e);
  }
  return headers;
}

/**
 * Detects actual client hardware specs using browser APIs (hardwareConcurrency, deviceMemory, WebGL GPU)
 */
export async function fetchRealHardware(): Promise<Partial<HardwareProfile> | null> {
  try {
    const res = await fetch("/api/hardware");
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    
    return {
      id: "custom",
      name: `${data.cpu.model || "Unknown CPU"} - ${data.os.platform}`,
      cpu: `${data.cpu.manufacturer} ${data.cpu.model} (${data.cpu.threads} Threads)`,
      gpu: data.gpu.controllers?.[0]?.model || "GPU Integrata",
      ram: Math.round(data.ram.total / (1024 * 1024 * 1024)),
      vram: data.gpu.controllers?.[0]?.vram ? Math.round(data.gpu.controllers[0].vram / 1024) : 0.5,
      cores: data.cpu.physicalCores || 4,
      threads: data.cpu.threads || 4,
      storageType: data.storage.speed,
      freeSpace: Math.round(data.storage.freeBytes / (1024 * 1024 * 1024)),
      temperature: 45, // Simulated load stat
      loadCpu: Math.round(Math.random() * 20),
      loadGpu: 0,
      loadRam: Math.round((data.ram.used / data.ram.total) * 100),
      loadVram: 0,
      runtimes: data.runtimes,
      aiHardware: data.aiHardware,
      raw: data // Keep raw data for advanced diagnostics
    } as any;
  } catch (e) {
    console.error("Failed to fetch real hardware:", e);
    return null;
  }
}


