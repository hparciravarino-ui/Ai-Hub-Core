import { useState, useEffect, useCallback } from "react";
import { HardwareDetector, FourTierHardwareState } from "../shared/hardware/HardwareDetector";

export interface ModelOptimizationProfile {
  recommendedModel: string;
  contextWindow: number;
  threads: number;
  gpuLayers: number;
  batchSize: number;
  lowResourceMode: boolean;
  temperature: number;
  numPredict: number;
  hardwareTier: "Legacy CPU/Embedded" | "Standard Client Node" | "Pro Workstation" | "Enterprise Server";
  unifiedMemoryActive: boolean;
  maxActiveModels: number;
  safetyMarginMemoryMB: number;
}

export function useAutoConfigEngine() {
  const [hardwareState, setHardwareState] = useState<FourTierHardwareState>(HardwareDetector.getState());
  const [optimization, setOptimization] = useState<ModelOptimizationProfile>(() =>
    calculateOptimization(HardwareDetector.getState())
  );

  // Subscribe to changes in the HardwareDetector state
  useEffect(() => {
    const unsubscribe = HardwareDetector.subscribe((state) => {
      setHardwareState(state);
      setOptimization(calculateOptimization(state));
    });
    return unsubscribe;
  }, []);

  // Function to manually trigger a hardware scan
  const scanHardware = useCallback(async () => {
    const freshState = await HardwareDetector.scan();
    setHardwareState(freshState);
    setOptimization(calculateOptimization(freshState));
    return freshState;
  }, []);

  return {
    hardwareState,
    optimization,
    scanHardware,
    isScanning: hardwareState.isScanning,
    lastScannedAt: hardwareState.lastScannedAt
  };
}

/**
 * Core optimization function that operates on host-level physical RAM & VRAM
 * instead of browser-reported values (which are heavily restricted / sandboxed).
 */
function calculateOptimization(state: FourTierHardwareState): ModelOptimizationProfile {
  const { host } = state;

  // Use the physical Host values, falling back to safe minimums if not populated yet
  const physicalRam = Math.max(1, host.ramGB || 8);
  const physicalVram = Math.max(0, host.vramGB || 0);
  const isAppleSilicon = host.cpuName.toLowerCase().includes("apple") || host.brandModel.toLowerCase().includes("apple");
  const isGpuAvailable = host.gpuName && 
    !host.gpuName.toLowerCase().includes("software") && 
    !host.gpuName.toLowerCase().includes("integrated") &&
    !host.gpuName.toLowerCase().includes("basic");

  let recommendedModel = "llama3.2:3b";
  let contextWindow = 4096;
  let threads = Math.max(1, (host.cores || 4) - 1); // Conserve 1 core for OS responsivity
  let gpuLayers = 0;
  let batchSize = 256;
  let lowResourceMode = false;
  let temperature = 0.7;
  let numPredict = 512;
  let hardwareTier: "Legacy CPU/Embedded" | "Standard Client Node" | "Pro Workstation" | "Enterprise Server" = "Standard Client Node";
  let unifiedMemoryActive = false;
  let maxActiveModels = 1;
  let safetyMarginMemoryMB = 1024;

  // Tier 1: Legacy CPU / Low Resource / Raspberry Pi
  if (physicalRam <= 4) {
    recommendedModel = "qwen2.5:0.5b";
    contextWindow = 2048;
    threads = Math.max(1, (host.cores || 4) - 1);
    gpuLayers = 0;
    batchSize = 128;
    lowResourceMode = true;
    temperature = 0.6;
    numPredict = 256;
    hardwareTier = "Legacy CPU/Embedded";
    maxActiveModels = 1;
    safetyMarginMemoryMB = 512;
  }
  // Tier 2: Standard Client Node (RAM > 4GB and RAM <= 8GB)
  else if (physicalRam <= 8) {
    recommendedModel = "llama3.2:3b";
    contextWindow = 4096;
    threads = Math.max(1, (host.cores || 4) - 1);
    batchSize = 256;
    lowResourceMode = false;
    hardwareTier = "Standard Client Node";
    maxActiveModels = 1;
    safetyMarginMemoryMB = 1536;

    // GPU layer calculations based on Host VRAM
    if (isAppleSilicon) {
      unifiedMemoryActive = true;
      gpuLayers = 24; // Apple Silicon unified memory can hold substantial layers
    } else if (isGpuAvailable && physicalVram >= 2) {
      gpuLayers = Math.min(16, Math.floor(physicalVram * 8)); 
    } else {
      gpuLayers = 0;
    }
  }
  // Tier 3: Pro Workstation (RAM > 8GB and RAM <= 16GB)
  else if (physicalRam <= 16) {
    recommendedModel = "qwen2.5-coder:7b";
    contextWindow = 8192;
    threads = Math.max(2, (host.cores || 8) - 2); // Save 2 cores for heavy system multitasking
    batchSize = 512;
    lowResourceMode = false;
    hardwareTier = "Pro Workstation";
    maxActiveModels = 2;
    safetyMarginMemoryMB = 2048;

    if (isAppleSilicon) {
      unifiedMemoryActive = true;
      gpuLayers = 32;
    } else if (isGpuAvailable) {
      if (physicalVram >= 8) {
        gpuLayers = 32; // Full offload of a 7B model
      } else if (physicalVram >= 6) {
        gpuLayers = 24;
      } else if (physicalVram >= 4) {
        gpuLayers = 16;
      } else {
        gpuLayers = 8;
      }
    }
  }
  // Tier 4: Enterprise Server / High-End Workstation (RAM > 16GB)
  else {
    recommendedModel = "mistral:7b";
    contextWindow = 16384;
    threads = Math.max(4, (host.threads || 16) - 4); // Leverage multi-threading heavily, leave 4 threads for host OS
    batchSize = 512;
    lowResourceMode = false;
    hardwareTier = "Enterprise Server";
    maxActiveModels = 3;
    safetyMarginMemoryMB = 4096;

    if (isAppleSilicon) {
      unifiedMemoryActive = true;
      gpuLayers = 48; // Extensive offloading
    } else if (isGpuAvailable) {
      if (physicalVram >= 12) {
        gpuLayers = 48; // Full offload of larger models
      } else if (physicalVram >= 8) {
        gpuLayers = 32;
      } else if (physicalVram >= 4) {
        gpuLayers = 20;
      } else {
        gpuLayers = 10;
      }
    }
  }

  return {
    recommendedModel,
    contextWindow,
    threads,
    gpuLayers,
    batchSize,
    lowResourceMode,
    temperature,
    numPredict,
    hardwareTier,
    unifiedMemoryActive,
    maxActiveModels,
    safetyMarginMemoryMB
  };
}
