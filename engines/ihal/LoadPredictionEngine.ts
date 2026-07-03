import { Logger } from "../../core/logging/Logger";
import { LoadPrediction, HardwareProfile } from "./types";

export class LoadPredictionEngine {
    private logger = Logger.getInstance();

    /**
     * 9.8 Load Prediction Engine
     * Predicts future load based on model size, task type, etc.
     */
    public predictLoad(
        taskType: string,
        modelSizeMb: number,
        contextSizeTokens: number,
        currentHardware: HardwareProfile
    ): LoadPrediction {
        // Simple heuristic for simulation
        const predictedRamMb = modelSizeMb * 1.2 + (contextSizeTokens * 0.05);
        const predictedVramMb = currentHardware.compute.gpuComputeUnits > 0 ? modelSizeMb * 1.1 : 0;
        
        let estimatedTimeMs = 500;
        if (taskType === "inference") {
            estimatedTimeMs = (modelSizeMb / 100) * (contextSizeTokens / 100);
            if (currentHardware.compute.gpuComputeUnits > 0) {
                estimatedTimeMs /= 5; // GPU speedup
            }
        }

        let thermalRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        if (currentHardware.thermal.temperatureCelsius > 70) thermalRisk = "MEDIUM";
        if (currentHardware.thermal.temperatureCelsius > 80) thermalRisk = "HIGH";

        let suggestedExecutionType: "CPU" | "GPU" | "NPU" = "CPU";
        if (currentHardware.compute.gpuComputeUnits > 0 && predictedVramMb <= currentHardware.memory.availableVramMb) {
            suggestedExecutionType = "GPU";
        }

        this.logger.debug(`[LoadPredictionEngine] Task: ${taskType}, Predicted RAM: ${predictedRamMb.toFixed(0)}MB, VRAM: ${predictedVramMb.toFixed(0)}MB, Time: ${estimatedTimeMs.toFixed(0)}ms`);

        return {
            predictedRamMb,
            predictedVramMb,
            estimatedTimeMs,
            thermalRisk,
            suggestedExecutionType
        };
    }
}
