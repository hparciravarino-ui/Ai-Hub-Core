import { HardwareProfile, PerformanceProfile, Model, Plugin, AuditLog } from "./types";

export const HARDWARE_PRESETS: HardwareProfile[] = [
  {
    id: "unknown",
    name: "Hardware Sconosciuto (Non ancora disponibile)",
    cpu: "Rilevamento hardware disabilitato",
    gpu: "-",
    ram: 0,
    vram: 0,
    cores: 0,
    threads: 0,
    storageType: "SSD",
    freeSpace: 0,
    temperature: 0,
    loadCpu: 0,
    loadGpu: 0,
    loadRam: 0,
    loadVram: 0,
  }
];

export const PERFORMANCE_PROFILES: PerformanceProfile[] = [
  {
    id: "eco",
    name: "Eco Profile",
    description: "Ideale per vecchi notebook o mini-PC. Minimizza la temperatura, arresta i processi in background, ed esegue quantizzazioni estreme in RAM compressa.",
    cpuThreadsMultiplier: 0.5,
    batchSize: 1,
    contextWindow: 1024,
    gpuOffloadRatio: 0,
    cachingLevel: "Low",
    ramSwapEnabled: true,
    modelStreaming: true,
    powerLimit: "Sotto-alimentato (Silenzioso)",
  },
  {
    id: "balanced",
    name: "Bilanciato",
    description: "Il profilo standard raccomandato. Bilancia i consumi, mantiene caricate le cache intermedie, e offre un tempo di risposta ottimizzato senza surriscaldare.",
    cpuThreadsMultiplier: 0.75,
    batchSize: 4,
    contextWindow: 2048,
    gpuOffloadRatio: 30,
    cachingLevel: "Medium",
    ramSwapEnabled: false,
    modelStreaming: false,
    powerLimit: "Standard Energetico",
  },
  {
    id: "performance",
    name: "Prestazioni",
    description: "Abilita l'offloading parziale su GPU o l'uso di tutti i core logici disponibili. Mantiene il modello residente in RAM per risposte istantanee.",
    cpuThreadsMultiplier: 1.0,
    batchSize: 8,
    contextWindow: 4096,
    gpuOffloadRatio: 80,
    cachingLevel: "High",
    ramSwapEnabled: false,
    modelStreaming: false,
    powerLimit: "Alte Prestazioni",
  },
  {
    id: "turbo",
    name: "Turbo Overdrive",
    description: "Sfrutta al 100% CPU e GPU. Adatto per lunghe elaborazioni batch, coding assistito complesso e compilazione RAG. I canali termici sono monitorati.",
    cpuThreadsMultiplier: 1.0,
    batchSize: 16,
    contextWindow: 8192,
    gpuOffloadRatio: 100,
    cachingLevel: "Aggressive",
    ramSwapEnabled: false,
    modelStreaming: false,
    powerLimit: "Overdrive Forzato",
  },
  {
    id: "quality",
    name: "Qualità Massima",
    description: "Focalizzato su modelli non-quantizzati o ad altissima fedeltà. Utilizza precisione FP16 e cache estesa, ideale per traduzioni di alta precisione o ragionamento logico.",
    cpuThreadsMultiplier: 0.8,
    batchSize: 2,
    contextWindow: 16384,
    gpuOffloadRatio: 50,
    cachingLevel: "Aggressive",
    ramSwapEnabled: false,
    modelStreaming: false,
    powerLimit: "Bilanciato Dinamico",
  }
];

export const MODEL_CATALOG: Model[] = [];

export const PLUGINS_LIST: Plugin[] = [];

export const SECURITY_LOGS: AuditLog[] = [];
