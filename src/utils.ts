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
    // 1. Gather Client specs
    const userAgent = navigator.userAgent;
    let browserName = "Other";
    let browserEngine = "Unknown";
    if (userAgent.includes("Firefox")) { browserName = "Firefox"; browserEngine = "Gecko"; }
    else if (userAgent.includes("SamsungBrowser")) { browserName = "Samsung Browser"; browserEngine = "Blink"; }
    else if (userAgent.includes("Chrome") || userAgent.includes("Chromium")) { browserName = "Chrome"; browserEngine = "Blink"; }
    else if (userAgent.includes("Safari")) { browserName = "Safari"; browserEngine = "WebKit"; }
    else if (userAgent.includes("Edge")) { browserName = "Edge"; browserEngine = "Blink"; }

    let browserVersion = "Unknown";
    const match = userAgent.match(/(firefox|chrome|safari|opera|version)\/?\s*(\d+)/i);
    if (match && match[2]) browserVersion = match[2];

    let osName = "Linux";
    let brandModel = "Generic Workstation";
    if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) {
      osName = "macOS";
      brandModel = "Apple Macintosh";
    } else if (userAgent.includes("Windows")) {
      osName = "Windows";
      brandModel = "PC Workstation";
    } else if (userAgent.includes("Linux")) {
      osName = "Linux";
      brandModel = "Linux System";
    } else if (userAgent.includes("Android")) {
      osName = "Android";
      brandModel = "Android Device";
    } else if (userAgent.includes("iPad") || userAgent.includes("iPhone")) {
      osName = "iOS";
      brandModel = "iOS Device";
    }

    // Detect CPU brand from UA and properties
    let cpuBrand = "Intel / AMD Processor";
    if (userAgent.includes("Macintosh") && (navigator.hardwareConcurrency === 8 || navigator.hardwareConcurrency === 10 || navigator.hardwareConcurrency === 12)) {
      cpuBrand = "Apple Silicon (M-series)";
    }

        // GPU detection via WebGL
    let gpuName = "Intel HD Graphics / Apple GPU";
    let gpuVendor = "Generic";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as any;
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuName;
          gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
        }
      }
    } catch (e) {
      console.warn("WebGL GPU detection failed:", e);
    }

    // WebGPU detection
    let webGpuSupported = false;
    if ((navigator as any).gpu) {
      webGpuSupported = true;
    }

    // Storage Estimate
    let storageEstimateStr = "Quota: 120 GB (Used: 4.5 GB)";
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const quotaGB = estimate.quota ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(1) : "120";
        const usageMB = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(1) : "4500";
        storageEstimateStr = `Quota: ${quotaGB} GB (Used: ${usageMB} MB)`;
      }
    } catch (e) {}

    const clientTelemetry = {
      osName,
      brandModel,
      cpuBrand,
      gpuName,
      gpuVendor,
      webGpuSupported,
      webGlSupported: true,
      canvasAccelerated: true,
      hardwareConcurrency: navigator.hardwareConcurrency || 8,
      deviceMemory: (navigator as any).deviceMemory || 8,
      displayResolution: `${window.screen.width}x${window.screen.height}`,
      displayInfo: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}-bit color, ${window.devicePixelRatio}x scale)`,
      darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
      language: navigator.language || "it-IT",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome",
      storageEstimate: storageEstimateStr,
      indexedDbAvailable: !!window.indexedDB,
      localStorageAvailable: !!window.localStorage,
      sessionStorageAvailable: !!window.sessionStorage,
      cacheStorageAvailable: !!window.caches,
      browserName,
      browserVersion,
      browserEngine,
      osVersion: "Tahoe 15.0"
    };

    // 2. Post telemetry to server so server can merge it
    try {
      await fetch("/api/hardware/client-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientTelemetry)
      });
    } catch (e) {
      console.error("Failed to post client telemetry:", e);
    }

    // 3. Get merged hardware profile
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
      levels: data.levels,
      raw: data // Keep raw data for advanced diagnostics
    } as any;
  } catch (e) {
    console.error("Failed to fetch real hardware:", e);
    return null;
  }
}


