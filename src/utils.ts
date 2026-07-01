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
  } catch (e) {
    console.error("Failed to parse API keys from localStorage", e);
  }
  return headers;
}

/**
 * Detects actual client hardware specs using browser APIs (hardwareConcurrency, deviceMemory, WebGL GPU)
 */
export function detectActualHardware(): Partial<HardwareProfile> {
  const result: Partial<HardwareProfile> = {};

  if (typeof navigator !== "undefined") {
    // Detect logical threads & calculate physical cores
    if (navigator.hardwareConcurrency) {
      result.threads = navigator.hardwareConcurrency;
      result.cores = navigator.hardwareConcurrency > 4
        ? Math.round(navigator.hardwareConcurrency / 2)
        : navigator.hardwareConcurrency;
    }

    // Detect approximate RAM in GB (e.g. 8, 16)
    if ((navigator as any).deviceMemory) {
      result.ram = (navigator as any).deviceMemory;
    }
  }

  // Detect GPU via WebGL
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as any;
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer) {
            let cleaned = renderer;
            const match = renderer.match(/(NVIDIA GeForce|AMD Radeon|Apple M[1234]|Intel\(R\) Iris|Intel UHD|RTX \d{3,4}|GTX \d{3,4})/i);
            if (match) {
              cleaned = match[0];
            } else {
              cleaned = renderer.replace(/ANGLE \(([^)]+)\)/, "$1").replace(/Direct3D.*/, "").trim();
            }
            result.gpu = cleaned;

            // Guess VRAM based on GPU name
            const lowerRenderer = renderer.toLowerCase();
            if (lowerRenderer.includes("rtx 4090")) result.vram = 24;
            else if (lowerRenderer.includes("rtx 4080")) result.vram = 16;
            else if (lowerRenderer.includes("rtx 4070")) result.vram = 12;
            else if (lowerRenderer.includes("rtx 4060")) result.vram = 8;
            else if (lowerRenderer.includes("rtx 3090")) result.vram = 24;
            else if (lowerRenderer.includes("rtx 3080")) result.vram = 10;
            else if (lowerRenderer.includes("rtx 3070")) result.vram = 8;
            else if (lowerRenderer.includes("rtx 3060")) result.vram = 12;
            else if (lowerRenderer.includes("apple m") || lowerRenderer.includes("metal")) {
              result.vram = result.ram ? Math.max(4, Math.round(result.ram * 0.75)) : 8;
            } else if (lowerRenderer.includes("radeon")) {
              result.vram = 8;
            } else if (lowerRenderer.includes("intel") || lowerRenderer.includes("iris") || lowerRenderer.includes("uhd")) {
              result.vram = 0.5;
            } else {
              result.vram = 4;
            }
          }
        }
      }
    } catch (e) {
      console.warn("WebGL GPU detection failed:", e);
    }
  }

  // Set default fallbacks if some detection is blocked
  if (!result.ram) result.ram = 8;
  if (!result.cores) result.cores = 4;
  if (!result.threads) result.threads = 4;
  if (!result.gpu) result.gpu = "GPU Integrata standard";
  if (!result.vram) result.vram = 0.5;

  return result;
}


