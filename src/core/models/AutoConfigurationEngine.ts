import { HardwareService } from "../services/HardwareService";

export class AutoConfigurationEngine {
  public static calculateOptimalConfig(hardware: any, modelSize: number, quantization: string) {
    let threads = 4;
    let gpuLayers = 0;
    let contextWindow = 4096;
    let batchSize = 512;
    
    if (hardware && hardware.cpu) {
      threads = Math.max(1, Math.floor(hardware.cpu.threads * 0.75));
    }

    if (hardware && hardware.gpu && hardware.gpu.controllers.length > 0) {
      const primaryGpu = hardware.gpu.controllers[0];
      const vramMb = primaryGpu.vram || 0;
      
      if (vramMb > 16000) {
        gpuLayers = 99; // Offload all
        batchSize = 2048;
        contextWindow = 32768;
      } else if (vramMb > 8000) {
        gpuLayers = 35;
        batchSize = 1024;
        contextWindow = 8192;
      } else if (vramMb > 4000) {
        gpuLayers = 15;
        batchSize = 512;
        contextWindow = 4096;
      }
    }

    // Apple Silicon optimizations
    if (hardware && hardware.cpu && hardware.cpu.manufacturer.includes('Apple')) {
      gpuLayers = 99; // Metal unifies memory
      batchSize = 1024;
    }

    return {
      threads,
      parallelism: 1,
      batchSize,
      gpuLayers,
      contextWindow,
      kvCache: "fp16",
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      repeatPenalty: 1.1,
      seed: -1,
      memoryMapping: true,
      offloading: gpuLayers > 0,
      caching: true,
      prefill: batchSize,
      speculativeDecoding: false
    };
  }
}
