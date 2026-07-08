export class ConfigurationEngine {
  public static generate(model: any, hardware: any) {
    let threads = 4;
    if (hardware.cpu && hardware.cpu.physicalCores) {
      threads = Math.min(hardware.cpu.physicalCores, 8); // Don't oversaturate
    }

    let batchSize = 512;
    let gpuLayers = 0;
    
    let vram = 0;
    if (hardware.gpu && hardware.gpu.controllers && hardware.gpu.controllers.length > 0) {
       vram = hardware.gpu.controllers[0].vram ? hardware.gpu.controllers[0].vram / 1024 : 0;
    }

    if (model.type === "local") {
        const modelSize = model.sizeEstimate;
        if (vram >= modelSize * 1.2) {
            gpuLayers = 99; // fully offload
            batchSize = 2048; // Can use larger batch
        } else if (vram >= modelSize * 0.5) {
            gpuLayers = 20; // partial
            batchSize = 1024;
        } else if (vram > 0) {
            gpuLayers = 10;
        }
    }

    let contextWindow = Math.min(model.context_length || 8192, 8192);
    // If we have limited RAM, reduce context
    const sysRam = hardware.ram.total / (1024 * 1024 * 1024);
    if (sysRam <= 8 && contextWindow > 4096) contextWindow = 4096;

    let temperature = 0.7;
    if (model.id.toLowerCase().includes("coder")) temperature = 0.2; // Lower for coding
    
    return {
      threads,
      batchSize,
      gpuLayers,
      contextWindow,
      kvCacheType: vram > 4 ? "f16" : "q8_0", // Quantize KV cache if low VRAM
      parallelism: sysRam > 16 ? 2 : 1,
      temperature,
      seed: -1
    };
  }
}
