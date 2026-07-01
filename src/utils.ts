import { HardwareProfile } from "./types";

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

/**
 * Dynamic content generation for localized fallback AI chat when Gemini API is unconfigured
 */
export function generateLocalSimulatedResponse(
  message: string,
  model: any,
  hardware: HardwareProfile,
  profileId: string
): string {
  const query = message.toLowerCase();
  
  if (query.includes("ram") || query.includes("memoria") || query.includes("libera") || query.includes("swap")) {
    return `**Analisi Allocazione RAM & Swap locale (Offline Simulator):**\n\n` +
      `Al momento stai utilizzando un profilo hardware **${hardware.name}** con **${hardware.ram} GB di RAM** e una GPU **${hardware.gpu}** con **${hardware.vram} GB di VRAM**.\n\n` +
      `Il modello attivo **${model?.name || "Llama 3.2"}** richiede circa **${model?.ramRequired || 4} GB** di RAM di picco per essere caricato senza colli di bottiglia.\n\n` +
      `**Raccomandazioni pratiche per prevenire interruzioni:**\n` +
      `1. **Riduci la Context Window:** Imposta la finestra di contesto a 1024 o 2048 token nel profilo operativo per dimezzare il consumo di cache di memoria.\n` +
      `2. **Abilita lo Swap su SSD:** Nella scheda **Ottimizzazione Hardware**, attiva il supporto RAM Swap su memoria a stato solido veloce (SSD).\n` +
      `3. **Usa GGUF Quantizzato:** Seleziona un modello con quantizzazione Q4_K_M o inferiore (es. Q2_K) nel modulo di gestione per caricare l'inferenza anche in soli 4GB di memoria disponibile.\n` +
      `4. **Configura i dati reali:** Se la telemetria non ha riconosciuto le caratteristiche del tuo computer, usa la funzione **✏️ Inserimento Manuale** nella scheda Ottimizzazione per rettificare la RAM e applicare i parametri ottimali.`;
  }
  
  if (query.includes("gguf") || query.includes("quantizz") || query.includes("format")) {
    return `**Guida e Consigli sulla Quantizzazione locale (Formato GGUF):**\n\n` +
      `Il formato **GGUF (GPT-Generated Unified Format)** è supportato nativamente dal nostro motore offline ed è ottimizzato per la tua CPU **${hardware.cpu}**:\n\n` +
      `* **Bilanciamento Q4_K_M (4 bit):** È la scelta ottimale sul tuo hardware. Conserva circa il 98% delle capacità cognitive del modello originale riducendo lo spazio richiesto di oltre il 60%.\n` +
      `* **Quantizzazione Estrema (IQ2_XS / Q2_K):** Riduce il modello ad appena 2 bit per esecuzione. Molto utile se la RAM del sistema è limitata a soli ${hardware.ram} GB.\n` +
      `* **Distribuzione GPU Layer:** Con la tua scheda **${hardware.gpu}** (**${hardware.vram} GB VRAM**), puoi offloadare circa **${hardware.vram >= 6 ? "70%" : "20%"}** dei layer in memoria video tramite le librerie WASM/WebNN o CUDA, velocizzando i token al secondo.`;
  }
  
  if (query.includes("install") || query.includes("scaric") || query.includes("attiv")) {
    return `**Stato dell'Installazione del motore locale:**\n\n` +
      `Per sbloccare il corretto funzionamento offline e l'elaborazione dei modelli installati:\n` +
      `1. Naviga sul pannello **Ottimizzazione Hardware**.\n` +
      `2. Seleziona **"Rilevamento Automatico"** o inserisci le specifiche corrette tramite **"✏️ Inserimento Manuale"**.\n` +
      `3. Fai clic sul pulsante **"Avvia Installazione Locale"** (o **"Forza Installazione"** se i requisiti non sono pienamente soddisfatti).\n` +
      `4. Il processo simulerà l'allocazione dei canali di memoria RAM locale e l'attivazione della sandbox crittografata offline. Al termine, il tuo sistema risulterà abilitato al 100%!`;
  }
  
  if (query.includes("ciao") || query.includes("salve") || query.includes("hello") || query.includes("chi sei") || query.includes("aiuto")) {
    return `Ciao! Sono il tuo **Senior AI Hub Advisor** in modalità locale offline.\n\n` +
      `La mia missione è aiutarti a configurare ed eseguire modelli di Intelligenza Artificiale open-source offline sul tuo PC, garantendo la privacy assoluta dei tuoi dati.\n\n` +
      `**Il tuo Hardware rilevato:**\n` +
      `* **PC:** ${hardware.name}\n` +
      `* **CPU:** ${hardware.cpu} (${hardware.cores} Cores / ${hardware.threads} Threads)\n` +
      `* **RAM:** ${hardware.ram} GB\n` +
      `* **GPU:** ${hardware.gpu} (${hardware.vram} GB VRAM)\n\n` +
      `Chiedimi pure indicazioni su come ottimizzare la velocità di inferenza, come abilitare il caching o quale modello del Marketplace si adatta meglio alla tua configurazione!`;
  }

  // Default smart assistant response template
  return `Grazie per avermi contattato! Come consulente senior di AI Hub locale, ho analizzato la tua richiesta rispetto alla tua configurazione di sistema attuale:\n\n` +
    `* **Sistema:** **${hardware.name}**\n` +
    `* **Hardware Attivo:** CPU **${hardware.cpu}** (${hardware.cores} core) + GPU **${hardware.gpu}** (**${hardware.vram}GB** VRAM)\n` +
    `* **Modello in uso:** **${model?.name || "Llama 3.2 3B"}** (formato **${model?.quant || "Q4_K_M"}**)\n` +
    `* **Profilo energetico:** **${profileId.toUpperCase()}**\n\n` +
    `**Consigli di ottimizzazione rapidi per questa sessione:**\n` +
    `- **Thread Allocati:** Il tuo processore ha ${hardware.threads} thread logici. Abbiamo impostato l'utilizzo ideale a **${Math.max(1, hardware.threads - 1)} thread** per massimizzare la velocità di calcolo senza congelare il sistema.\n` +
    `- **Consumo di RAM:** Il modello richiede **${model?.ramRequired || 4} GB**. Con la tua RAM di **${hardware.ram} GB**, l'esecuzione è sicura. Se riscontri rallentamenti, sposta il profilo operativo su **Eco Mode** per alleggerire il carico.\n\n` +
    `*Nota: Per sbloccare la diagnosi automatica avanzata connessa in cloud e l'uso dell'API di produzione, inserisci una chiave valida nelle impostazioni in alto.*`;
}
