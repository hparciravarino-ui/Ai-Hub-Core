import { Logger } from "../../core/logging/Logger";
import { HardwareProfile, ResourceAllocationRequest } from "./types";
import { EventManager } from "../../core/events/EventManager";

export class ResourceScheduler {
    private logger = Logger.getInstance();
    private eventBus = EventManager.getInstance();

    /**
     * 9.10 GPU Scheduler & 9.11 CPU Scheduler
     * Manages fallback, distribution, multi-gpu balancing.
     */
    public scheduleTask(request: ResourceAllocationRequest, profile: HardwareProfile): boolean {
        this.logger.debug(`[ResourceScheduler] Scheduling task ${request.taskId} with preferred execution: ${request.preferredExecutionType}`);

        // 9.12 Thermal Management System checks
        if (profile.thermal.thermalThrottlingState === "SEVERE") {
            this.logger.warn(`[ThermalManager] Severe thermal throttling! Delaying non-critical tasks.`);
            if (request.priority !== "CRITICAL") {
                return false; // reject or delay
            }
        }

        // 9.13 Power Awareness Layer
        if (profile.power.batteryState === "BATTERY" && profile.power.batteryLevelPercent < 20) {
            this.logger.warn(`[PowerManager] Battery critical (<20%). Limiting GPU usage.`);
            if (request.preferredExecutionType === "GPU") {
                this.logger.info(`[ResourceScheduler] Forcing CPU execution due to low battery.`);
                request.preferredExecutionType = "CPU"; // 9.17 Fallback
            }
        }

        // Actual scheduling logic (simulated)
        if (request.preferredExecutionType === "GPU") {
            if (profile.memory.availableVramMb >= (request.requiredVramMb || 0)) {
                this.logger.info(`[ResourceScheduler] Task ${request.taskId} scheduled on GPU.`);
                profile.memory.availableVramMb -= (request.requiredVramMb || 0);
                this.eventBus.publish("TaskScheduled", { taskId: request.taskId, target: "GPU" });
                return true;
            } else {
                this.logger.warn(`[ResourceScheduler] Insufficient VRAM for Task ${request.taskId}. Initiating fallback to CPU.`);
                // Fallback to CPU
                request.preferredExecutionType = "CPU";
            }
        }

        if (request.preferredExecutionType === "CPU") {
            if (profile.memory.availableRamMb >= request.requiredRamMb) {
                this.logger.info(`[ResourceScheduler] Task ${request.taskId} scheduled on CPU.`);
                profile.memory.availableRamMb -= request.requiredRamMb;
                this.eventBus.publish("TaskScheduled", { taskId: request.taskId, target: "CPU" });
                return true;
            }
        }

        this.logger.error(`[ResourceScheduler] Failed to schedule task ${request.taskId}. Resources exhausted.`);
        return false;
    }

    public releaseResources(request: ResourceAllocationRequest, profile: HardwareProfile) {
        if (request.preferredExecutionType === "GPU" && request.requiredVramMb) {
            profile.memory.availableVramMb += request.requiredVramMb;
        } else {
            profile.memory.availableRamMb += request.requiredRamMb;
        }
        this.logger.debug(`[ResourceScheduler] Released resources for task ${request.taskId}`);
    }
}
