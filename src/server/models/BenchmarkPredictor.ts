export class BenchmarkPredictor {
  public static predict(model: any, config: any, hardware: any) {
    if (model.type === "api") {
      return {
        estimatedSpeed: 100,
        bottleneck: "Network / API Limit",
        speedText: "API Speed"
      };
    }

    let estimatedSpeed = 20; // base t/s
    let bottleneck = "CPU";

    if (config.gpuLayers === 99) {
      estimatedSpeed = 50 + (config.batchSize / 100);
      bottleneck = "VRAM Memory Bandwidth";
    } else if (config.gpuLayers > 0) {
      estimatedSpeed = 30;
      bottleneck = "PCIe Transfer / VRAM";
    } else {
      estimatedSpeed = config.threads * 2.5;
      bottleneck = "RAM Memory Bandwidth";
    }

    const sysRam = hardware.ram.total / (1024 * 1024 * 1024);
    if (sysRam < 16 && config.gpuLayers === 0) {
      estimatedSpeed *= 0.7; // Penalize for slow single channel or constrained RAM
    }

    if (model.sizeEstimate > 10) estimatedSpeed *= 0.5; // Bigger models are slower
    if (model.sizeEstimate > 30) estimatedSpeed *= 0.3;

    return {
      estimatedSpeed: Math.round(Math.max(1, estimatedSpeed)),
      bottleneck,
      speedText: `${Math.round(Math.max(1, estimatedSpeed))} t/s`
    };
  }
}
