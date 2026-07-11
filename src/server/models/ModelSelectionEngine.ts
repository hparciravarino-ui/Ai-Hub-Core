import fs from 'fs';
import path from 'path';
import { HardwareEngine } from '../../shared/hardware/HardwareEngine';
import { BenchmarkDatabase } from '../benchmark/BenchmarkDatabase';
import { EnterpriseModelManager } from '../../core/models/EnterpriseModelManager';
import { MODEL_CATALOG } from '../../data';
import { ModelSearch } from './ModelSearch';

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
    estimatedCostUSD: number; // cost per 1M tokens
  };
  reasons: string[];
}

export class ModelSelectionEngine {
  /**
   * Evaluates all models dynamically using a Multi-Criteria Decision-Making (MCDM) model.
   * Leverages real hardware scanning, historical and generalized system benchmarks,
   * task context, pricing, and dynamic exclusion for automated failover.
   */
  public static async selectBestModel(request: SelectionRequest, failedModelIds: string[] = []): Promise<ModelRankingResult[]> {
    // 1. Scan actual host hardware and sandboxed limits
    const hardware = await HardwareEngine.scan();
    const sysRamBytes = hardware.ram?.total || 8 * 1024 * 1024 * 1024;
    const sysRamGB = sysRamBytes / (1024 * 1024 * 1024);
    
    // Detect system GPU memory dynamically
    let sysVramGB = 0;
    let isAppleSilicon = false;
    
    if (hardware.gpu?.controllers && hardware.gpu.controllers.length > 0) {
      sysVramGB = (hardware.gpu.controllers[0].vram || 0) / 1024;
    }
    
    const cpuModel = (hardware.cpu?.model || '').toLowerCase();
    const osDistro = (hardware.os?.distro || '').toLowerCase();
    if (cpuModel.includes('apple') || cpuModel.includes('m1') || cpuModel.includes('m2') || cpuModel.includes('m3') || cpuModel.includes('m4') || osDistro.includes('darwin')) {
      isAppleSilicon = true;
      sysVramGB = sysRamGB * 0.75; // Apple unified memory typically allows up to 75% for graphics
    }

    // 2. Fetch all historical benchmarks to enable learning
    const benchmarks = await BenchmarkDatabase.getAllResults();
    
    // Core hardware profile calibration from physical benchmarks
    let systemCpuOpsPerSec = 5000000; // calibrated baseline
    let systemRamSpeedMBs = 12000;
    let systemDiskSpeedMBs = 500;
    let systemVectorsPerSec = 15000;
    let hasSystemBenchmarks = false;

    // Load actual physical system performance metrics from previous tests
    const completedBenchmarks = benchmarks.filter((b: any) => b.status === 'completed' && b.metrics);
    if (completedBenchmarks.length > 0) {
      // Use the latest test to fetch raw hardware limits
      const lastBench = completedBenchmarks[completedBenchmarks.length - 1];
      if (lastBench.metrics.cpuOpsPerSec) systemCpuOpsPerSec = lastBench.metrics.cpuOpsPerSec;
      if (lastBench.metrics.ramSpeedMBs) systemRamSpeedMBs = lastBench.metrics.ramSpeedMBs;
      if (lastBench.metrics.diskSpeedMBs) systemDiskSpeedMBs = lastBench.metrics.diskSpeedMBs;
      if (lastBench.metrics.vectorsPerSec) systemVectorsPerSec = lastBench.metrics.vectorsPerSec;
      hasSystemBenchmarks = true;
    }

    // 3. Populate dynamic, non-hardcoded model catalog from unified sources
    const catalog: any[] = [];

    // Source A: Local MODEL_CATALOG inside src/data.ts
    if (MODEL_CATALOG && MODEL_CATALOG.length > 0) {
      for (const m of MODEL_CATALOG) {
        if (!catalog.some(c => c.id === m.id)) {
          let capabilities = ['chat'];
          const cat = (m.category || '').toLowerCase();
          if (cat.includes('coding')) capabilities.push('coding', 'agent');
          if (cat.includes('reasoning')) capabilities.push('reasoning');
          if (cat.includes('audio')) capabilities.push('audio');
          if (cat.includes('image') || cat.includes('vision')) capabilities.push('multimodal', 'vision');

          catalog.push({
            id: m.id,
            name: m.name,
            type: 'local',
            context_length: m.id.includes('14b') ? 16384 : 8192,
            sizeEstimate: m.ramRequired || 4.5,
            vramRequired: m.vramRequired || 3.5,
            capabilities,
            pricing: { prompt: "0.00000", completion: "0.00000" }
          });
        }
      }
    }

    // Source B: EnterpriseModelManager
    try {
      const managerModels = EnterpriseModelManager.getModels() || [];
      for (const m of managerModels) {
        if (!catalog.some(c => c.id === m.id)) {
          catalog.push({
            id: m.id,
            name: m.name,
            type: m.type || 'local',
            context_length: m.context_length || m.contextWindow || 8192,
            sizeEstimate: m.sizeEstimate || (m.size ? parseFloat(m.size) : 4.5),
            vramRequired: m.vramRequired || (m.vram ? parseFloat(m.vram) : 3.5),
            capabilities: m.capabilities || m.tags || ['chat'],
            pricing: m.pricing || { prompt: "0.00000", completion: "0.00000" }
          });
        }
      }
    } catch (e) {
      console.warn("[ModelSelectionEngine] Could not load from EnterpriseModelManager:", e);
    }

    // Source C: Dynamic Web Model Search results
    try {
      const searchModels = await ModelSearch.fetchModels();
      if (searchModels && searchModels.length > 0) {
        for (const m of searchModels) {
          if (!catalog.some(c => c.id === m.id)) {
            catalog.push({
              id: m.id,
              name: m.name,
              type: m.type || 'local',
              context_length: m.context_length || 8192,
              sizeEstimate: m.sizeEstimate || 4.5,
              vramRequired: m.vramRequired || (m.sizeEstimate ? m.sizeEstimate * 0.8 : 3.5),
              capabilities: m.capabilities || (m.tags ? m.tags.map((t: string) => t.toLowerCase()) : ['chat']),
              pricing: m.pricing || { prompt: "0.00000", completion: "0.00000" }
            });
          }
        }
      }
    } catch (e) {
      console.warn("[ModelSelectionEngine] Could not merge dynamic search models:", e);
    }

    // Source D: Global fallback API Cloud definitions to ensure complete selection space
    const apiCloudModels = [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", type: "api", context_length: 1048576, sizeEstimate: 0, vramRequired: 0, capabilities: ["chat", "coding", "rag", "reasoning", "agent", "multimodal", "vision"], pricing: { prompt: "0.000000075", completion: "0.0000003" } },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", type: "api", context_length: 2097152, sizeEstimate: 0, vramRequired: 0, capabilities: ["chat", "coding", "rag", "reasoning", "agent", "multimodal", "vision"], pricing: { prompt: "0.00000125", completion: "0.000005" } },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", type: "api", context_length: 200000, sizeEstimate: 0, vramRequired: 0, capabilities: ["chat", "coding", "reasoning", "agent", "multimodal", "vision"], pricing: { prompt: "0.000003", completion: "0.000015" } }
    ];
    for (const api of apiCloudModels) {
      if (!catalog.some(c => c.id === api.id)) {
        catalog.push(api);
      }
    }

    const ranked: ModelRankingResult[] = [];

    // 4. Iterate and Score Each Candidate using Multi-Criteria Summation
    for (const model of catalog) {
      // Exclude failed models under automated active failover
      if (failedModelIds.includes(model.id)) {
        continue;
      }

      // Check required capabilities if defined in request
      if (request.requiredCapabilities && request.requiredCapabilities.length > 0) {
        const hasAll = request.requiredCapabilities.every(cap => model.capabilities.includes(cap));
        if (!hasAll) continue;
      }

      let finalScore = 0;
      const reasons: string[] = [];

      // A. COMPUTE INDEPENDENT CURRENT PERFORMANCE PROFILE (Throughput and Latency)
      const modelBenchmarks = completedBenchmarks.filter((b: any) => b.modelId === model.id);
      let speedTps = 0;
      let latencyMs = 0;
      let hasDirectBenchmark = false;

      if (modelBenchmarks.length > 0) {
        // Continuous Learning: Average actual historical measurements for this specific model
        const speedSum = modelBenchmarks.reduce((sum: number, b: any) => sum + b.metrics.tokensPerSecond, 0);
        const latencySum = modelBenchmarks.reduce((sum: number, b: any) => sum + b.metrics.timeToFirstTokenMs, 0);
        speedTps = speedSum / modelBenchmarks.length;
        latencyMs = latencySum / modelBenchmarks.length;
        hasDirectBenchmark = true;
        reasons.push(`Benchmark reale: ${speedTps.toFixed(1)} t/s, latenza ${Math.round(latencyMs)}ms`);
      } else {
        // Continuous Learning: No specific test on this model, predict using general physical characteristics
        if (model.type === 'api') {
          speedTps = 65.0; // cloud speeds
          latencyMs = 220; // standard latency
          reasons.push("Modello Cloud: Stima di rete latenza e banda");
        } else {
          // Local execution predicted from actual math / memory test averages
          const sizeCoeff = model.sizeEstimate || 4.5;
          speedTps = (systemCpuOpsPerSec / 150000) * (systemRamSpeedMBs / 5000) * (1.0 / sizeCoeff);
          speedTps = Math.max(1.5, Number(speedTps.toFixed(2)));
          
          latencyMs = (1000000 / systemCpuOpsPerSec) * sizeCoeff * 140;
          latencyMs = Math.max(20, Math.round(latencyMs));
          
          if (hasSystemBenchmarks) {
            reasons.push(`Stima predittiva hardware: ${speedTps.toFixed(1)} t/s basata su benchmark di sistema`);
          } else {
            reasons.push(`Stima predittiva hardware standard: ${speedTps.toFixed(1)} t/s`);
          }
        }
      }

      // CRITERION 1: Hardware Compatibility & Dedicated Allocation (Weight: 30%)
      let hardwareScore = 100;
      if (model.type === 'local') {
        const reqRam = model.sizeEstimate * 1.25; // 25% overhead
        if (sysRamGB < reqRam) {
          hardwareScore = 0; // Completely incompatible - disqualification
          reasons.push(`Incompatibile: RAM richiesta ${reqRam.toFixed(1)}GB, installata ${sysRamGB.toFixed(1)}GB`);
        } else {
          // High RAM match. Score depends on GPU offloading potential
          const reqVram = model.vramRequired || (model.sizeEstimate * 0.8);
          if (isAppleSilicon) {
            hardwareScore = 100; // Apple Silicon handles unified memory offloads perfectly
            reasons.push("RAM/GPU unificata Apple Silicon (Metal)");
          } else if (sysVramGB >= reqVram) {
            hardwareScore = 100; // Full GPU offloading
            reasons.push("Offload GPU totale (VRAM dedicata sufficiente)");
          } else if (sysVramGB > 0) {
            const offloadRatio = sysVramGB / reqVram;
            hardwareScore = 60 + Math.round(offloadRatio * 35); // Partial offloading
            reasons.push(`Offload GPU parziale (${Math.round(offloadRatio * 100)}% dei layer)`);
          } else {
            hardwareScore = 60; // pure CPU
            reasons.push("Esecuzione pura su CPU (lento)");
          }
        }
      } else {
        // API requires network only, no physical memory overhead
        hardwareScore = 100;
      }
      finalScore += hardwareScore * 0.30;

      // CRITERION 2: Throughput & Latency Performance (Weight: 25%)
      let performanceScore = 0;
      if (model.type === 'api') {
        // APIs are fast but network capped
        performanceScore = 90;
      } else {
        // Local: score scale based on tokens/second
        const tpsScore = Math.min(100, (speedTps / 40) * 100);
        const latScore = Math.max(0, 100 - (latencyMs / 15));
        performanceScore = (tpsScore * 0.6) + (latScore * 0.4);
      }
      finalScore += performanceScore * 0.25;

      // CRITERION 3: Task Context Appropriateness (Weight: 20%)
      let taskScore = 50;
      const type = request.taskType;
      
      // Strict capability block
      if (type === 'multimodal' && !model.capabilities.includes('multimodal') && !model.capabilities.includes('vision')) {
        taskScore = 0;
      } else if (type === 'audio' && !model.capabilities.includes('audio')) {
        taskScore = 0;
      } else {
        // Check task-specific optimization
        if (model.capabilities.includes(type)) {
          taskScore = 90;
          if (type === 'coding' && (model.id.includes('coder') || model.id.includes('qwen'))) {
            taskScore = 100; // Specialist boost
          } else if (type === 'reasoning' && (model.id.includes('r1') || model.id.includes('reasoning') || model.id.includes('pro'))) {
            taskScore = 100; // Specialist boost
          }
        } else {
          // general chat suitability
          taskScore = model.capabilities.includes('chat') ? 70 : 30;
        }
      }
      finalScore += taskScore * 0.20;

      // CRITERION 4: Context Length & Headroom Alignment (Weight: 15%)
      let contextScore = 100;
      const tokensNeeded = request.promptTokens || 1500;
      if (tokensNeeded > model.context_length) {
        contextScore = 0; // Disqualification
        reasons.push(`Incompatibile: Richiesti ${tokensNeeded} token, limite finestra ${model.context_length}`);
      } else {
        // Check context headroom. Higher window is better for long RAG
        const ratio = model.context_length / tokensNeeded;
        if (ratio > 10) contextScore = 100;
        else if (ratio > 3) contextScore = 85;
        else contextScore = 60;
      }
      finalScore += contextScore * 0.15;

      // CRITERION 5: Cost Effectiveness & Resource Saving (Weight: 10%)
      let costScore = 100;
      let costUSD1M = 0;
      if (model.type === 'api') {
        // Price calculated per 1 million tokens (avg 70% prompt / 30% completion)
        const promptPrice = parseFloat(model.pricing?.prompt || "0.00000");
        const completionPrice = parseFloat(model.pricing?.completion || "0.00000");
        costUSD1M = (promptPrice * 0.7 + completionPrice * 0.3) * 1000000;
        
        // Scale cost score down based on price. Max penalty at $15/1M
        costScore = Math.max(5, 100 - (costUSD1M * 6.5));
      } else {
        // Local is 100% free!
        costScore = 100;
      }
      finalScore += costScore * 0.10;

      // APPLY STRICT CONSTRAINTS AND PENALTIES
      if (request.forceLocal && model.type === 'api') {
        finalScore = 0; // Force Local disqualifies cloud
        reasons.push("Filtro: Escluso per vincolo Offline Locale");
      }

      if (request.attachmentsCount && request.attachmentsCount > 0 && !model.capabilities.includes('vision') && !model.capabilities.includes('multimodal')) {
        finalScore *= 0.5; // Heavy penalty for no vision on files
        reasons.push("Penalità: Presenti allegati ma il modello non supporta l'analisi visiva");
      }

      const scoreRounded = Math.max(0, Math.round(finalScore));

      if (scoreRounded > 0 && hardwareScore > 0 && contextScore > 0 && taskScore > 0) {
        ranked.push({
          modelId: model.id,
          name: model.name,
          provider: model.type as 'local' | 'api',
          score: scoreRounded,
          metrics: {
            predictedSpeed: Number(speedTps.toFixed(1)),
            latencyMs: Math.round(latencyMs),
            ramOverheadGB: model.type === 'local' ? model.sizeEstimate : 0,
            estimatedCostUSD: Number(costUSD1M.toFixed(3))
          },
          reasons: reasons.slice(0, 3)
        });
      }
    }

    // Sort descending by calculated multi-criteria score
    return ranked.sort((a, b) => b.score - a.score);
  }

  /**
   * Automatically routes execution to the next best compatible failover model.
   * If a model fails, we exclude it from selection.
   */
  public static async getFailoverModel(failedModelId: string, request: SelectionRequest): Promise<ModelRankingResult | null> {
    console.warn(`[ModelSelectionEngine] Initiating automated failover for failed model: ${failedModelId}`);
    const alternativeCandidates = await this.selectBestModel(request, [failedModelId]);
    
    if (alternativeCandidates.length > 0) {
      const bestAlternative = alternativeCandidates[0];
      console.log(`[ModelSelectionEngine] Failover completed: Routed dynamically to model: ${bestAlternative.modelId} (Score: ${bestAlternative.score})`);
      return bestAlternative;
    }
    
    return null;
  }
}
