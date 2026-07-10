import fs from 'fs';
import path from 'path';
import { HardwareEngine } from '../../shared/hardware/HardwareEngine';
import { BenchmarkDatabase } from '../benchmark/BenchmarkDatabase';
import { EnterpriseModelManager } from '../../core/models/EnterpriseModelManager';

export interface SelectionRequest {
  taskType: 'coding' | 'chat' | 'rag' | 'reasoning' | 'agent' | 'multimodal' | 'translation' | 'audio';
  promptTokens?: number;
  attachmentsCount?: number;
  forceLocal?: boolean;
  requiredCapabilities?: string[];
}

export interface ModelRankingResult {
  modelId: string;
  name: string;
  provider: 'local' | 'api';
  score: number;
  metrics: {
    predictedSpeed: number;
    latencyMs: number;
    ramOverheadGB: number;
  };
  reasons: string[];
}

export class ModelSelectionEngine {
  /**
   * Evaluates all models in the catalog using a dynamic Multi-Criteria Decision-Making (MCDM) model.
   * Weighs hardware fit, actual performance from benchmark results, task suitability, and constraints.
   */
  public static async selectBestModel(request: SelectionRequest): Promise<ModelRankingResult[]> {
    const hardware = await HardwareEngine.scan();
    const benchmarks = await BenchmarkDatabase.getAllResults();
    
    // Default model catalog (combines local and cloud API models)
    const catalog = [
      { id: "llama-3-8b", name: "Llama 3 8B", type: "local", context_length: 8192, sizeEstimate: 4.5, capabilities: ["chat", "coding", "rag"] },
      { id: "llava-1.5", name: "LLaVA 1.5 (Vision)", type: "local", context_length: 4096, sizeEstimate: 4.5, capabilities: ["chat", "multimodal", "vision"] },
      { id: "deepseek-coder-7b", name: "DeepSeek Coder 7B", type: "local", context_length: 16384, sizeEstimate: 4.8, capabilities: ["coding", "agent"] },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", type: "api", context_length: 1048576, sizeEstimate: 0, capabilities: ["chat", "coding", "rag", "reasoning", "agent", "multimodal", "vision"] },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", type: "api", context_length: 2097152, sizeEstimate: 0, capabilities: ["chat", "coding", "rag", "reasoning", "agent", "multimodal", "vision"] },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", type: "api", context_length: 200000, sizeEstimate: 0, capabilities: ["chat", "coding", "reasoning", "agent", "multimodal", "vision"] }
    ];

    const ranked: ModelRankingResult[] = [];
    const sysRamGB = hardware.ram.total / (1024 * 1024 * 1024);
    
    // Detect system VRAM if GPU is available
    let sysVramGB = 0;
    if (hardware.gpu && hardware.gpu.controllers && hardware.gpu.controllers.length > 0) {
      sysVramGB = (hardware.gpu.controllers[0].vram || 0) / 1024;
    }

    for (const model of catalog) {
      let score = 0;
      const reasons: string[] = [];
      
      // Look up historical benchmark metrics for this model to see if we have real local profiles
      const modelBenchmarks = benchmarks.filter((b: any) => b.modelId === model.id && b.status === 'completed');
      
      let speedTps = model.type === 'api' ? 70 : 15; // default fallbacks
      let latencyMs = model.type === 'api' ? 250 : 600;
      
      if (modelBenchmarks.length > 0) {
        // Average actual performance statistics from historical runs
        const speedSum = modelBenchmarks.reduce((sum: number, b: any) => sum + b.metrics.tokensPerSecond, 0);
        const latencySum = modelBenchmarks.reduce((sum: number, b: any) => sum + b.metrics.timeToFirstTokenMs, 0);
        speedTps = speedSum / modelBenchmarks.length;
        latencyMs = latencySum / modelBenchmarks.length;
        reasons.push(`Usa benchmark storici reali (${speedTps.toFixed(1)} t/s, ${Math.round(latencyMs)}ms latenza)`);
      } else {
        reasons.push("Usa stima predittiva iniziale (nessun benchmark presente)");
      }

      // CRITERION 1: Hardware Compatibility & Memory Footprint (Weight: 35%)
      let hardwareScore = 100;
      if (model.type === 'local') {
        const requiredRam = model.sizeEstimate * 1.25; // 25% overhead
        if (sysRamGB < requiredRam) {
          hardwareScore = 0; // Completely incompatible, won't fit in physical RAM
          reasons.push(`RAM Insufficiente: richiesti ${requiredRam.toFixed(1)}GB, installati ${sysRamGB.toFixed(1)}GB`);
        } else if (sysVramGB >= model.sizeEstimate) {
          hardwareScore = 100; // Perfect fit in dedicated GPU memory
          reasons.push("GPU Offloading completo (VRAM adatta)");
        } else if (sysVramGB > 0) {
          hardwareScore = 80; // Fits in RAM, partial GPU offload
          reasons.push("Compatibilità buona (offload GPU parziale)");
        } else {
          hardwareScore = 60; // CPU/RAM execution only
          reasons.push("Esecuzione CPU + RAM pura");
        }
      } else {
        // Cloud APIs require no local hardware except net
        hardwareScore = 100;
        reasons.push("Nessun carico hardware locale (Cloud API)");
      }
      
      score += hardwareScore * 0.35;

      // CRITERION 2: Task Appropriateness & Special Capabilities (Weight: 30%)
      let taskScore = 50;
      
      // Multimodal compatibility guard
      if (request.taskType === 'multimodal' && !model.capabilities.includes('multimodal')) {
        taskScore = 0;
        reasons.push("Escluso: Manca capacità multimediale richiesta");
      } else if (request.taskType === 'coding' && model.capabilities.includes('coding')) {
        taskScore = model.id.includes('coder') ? 100 : 85;
        reasons.push("Ottimizzato per flussi di programmazione");
      } else if (request.taskType === 'reasoning' && model.capabilities.includes('reasoning')) {
        taskScore = model.id.includes('pro') ? 100 : 85;
        reasons.push("Abilitato per logica e ragionamento profondo");
      } else if (model.capabilities.includes(request.taskType)) {
        taskScore = 90;
        reasons.push(`Supporto nativo per task tipo: ${request.taskType}`);
      }
      
      score += taskScore * 0.30;

      // CRITERION 3: Context Size & Payload Handling (Weight: 15%)
      let contextScore = 50;
      const tokenLoad = request.promptTokens || 1000;
      
      if (tokenLoad > model.context_length) {
        contextScore = 0; // Exceeds context window limits
        reasons.push(`Escluso: Lunghezza prompt (${tokenLoad} t) supera finestra contesto (${model.context_length} t)`);
      } else if (model.context_length >= 200000 && tokenLoad > 20000) {
        contextScore = 100;
        reasons.push("Ottimo per analisi documenti di grandi dimensioni");
      } else if (model.context_length >= 16384) {
        contextScore = 80;
        reasons.push("Spazio di contesto esteso adatto per RAG");
      }
      
      score += contextScore * 0.15;

      // CRITERION 4: Performance Speed & Latency (Weight: 20%)
      // Max 100 points, calibrated from speed TPS (weighting faster models)
      const speedScore = Math.min(100, (speedTps / 80) * 100);
      score += speedScore * 0.20;

      // CONSTRAINTS & FILTER PENALTIES
      if (request.forceLocal && model.type === 'api') {
        score = 0; // Filtered out
        reasons.push("Escluso: Richiesto vincolo di esecuzione locale offline");
      }

      if (request.attachmentsCount && request.attachmentsCount > 0 && !model.capabilities.includes('vision')) {
        score -= 40; // Penalize models that can't digest files visually
        reasons.push("Penalità: Presenti allegati ma il modello non supporta la visione");
      }

      // Cap at 0 to 100 range
      const finalScore = Math.max(0, Math.round(score));
      
      if (finalScore > 0) {
        ranked.push({
          modelId: model.id,
          name: model.name,
          provider: model.type as 'local' | 'api',
          score: finalScore,
          metrics: {
            predictedSpeed: Number(speedTps.toFixed(1)),
            latencyMs: Math.round(latencyMs),
            ramOverheadGB: model.type === 'local' ? model.sizeEstimate : 0
          },
          reasons: reasons.slice(0, 3)
        });
      }
    }

    // Sort by final multicriteria score descending
    return ranked.sort((a, b) => b.score - a.score);
  }

  /**
   * Automates the failover routing logic. If the selected model fails, 
   * returns the next best compatible alternative.
   */
  public static async getFailoverModel(failedModelId: string, request: SelectionRequest): Promise<ModelRankingResult | null> {
    const candidates = await this.selectBestModel(request);
    const index = candidates.findIndex(c => c.modelId === failedModelId);
    
    if (index !== -1 && index + 1 < candidates.length) {
      console.warn(`[ModelSelectionEngine] Failover: ${failedModelId} failed. Routing automatically to fallback model: ${candidates[index + 1].modelId}`);
      return candidates[index + 1];
    }
    
    // Return first candidate that isn't the failed one if not found in ranking list
    const alternative = candidates.find(c => c.modelId !== failedModelId);
    return alternative || null;
  }
}
