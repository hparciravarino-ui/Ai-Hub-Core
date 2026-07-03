export type HardwareMode = "LOW_POWER" | "BALANCED" | "HIGH_PERFORMANCE";
export type Architecture = "x86_64" | "ARM64" | "Apple_Silicon";
export type PowerState = "AC" | "BATTERY";

export interface ComputeCapabilities {
    singleThreadPerformance: number; // arbitrary score
    multiThreadPerformance: number;  // arbitrary score
    vectorizationSupport: string[];  // AVX2, NEON, etc.
    gpuComputeUnits: number;
    npuAvailable: boolean;
}

export interface MemoryCapabilities {
    totalRamMb: number;
    availableRamMb: number;
    memoryBandwidthGBs: number;
    totalVramMb: number;
    availableVramMb: number;
}

export interface StorageCapabilities {
    isSSD: boolean;
    readSpeedMBs: number;
    writeSpeedMBs: number;
    iops: number;
}

export interface ThermalCapabilities {
    temperatureCelsius: number;
    thermalThrottlingState: "NONE" | "LIGHT" | "SEVERE";
}

export interface PowerCapabilities {
    batteryState: PowerState;
    powerMode: "performance" | "balanced" | "saver";
    batteryLevelPercent: number;
}

export interface HardwareProfile {
    mode: HardwareMode;
    arch: Architecture;
    compute: ComputeCapabilities;
    memory: MemoryCapabilities;
    storage: StorageCapabilities;
    thermal: ThermalCapabilities;
    power: PowerCapabilities;
}

export interface ResourceAllocationRequest {
    taskId: string;
    requiredRamMb: number;
    requiredVramMb?: number;
    preferredExecutionType: "CPU" | "GPU" | "NPU";
    priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
}

export interface LoadPrediction {
    predictedRamMb: number;
    predictedVramMb: number;
    estimatedTimeMs: number;
    thermalRisk: "LOW" | "MEDIUM" | "HIGH";
    suggestedExecutionType: "CPU" | "GPU" | "NPU";
}
