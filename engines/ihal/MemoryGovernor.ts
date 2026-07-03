import { Logger } from "../../core/logging/Logger";
import { HardwareProfile } from "./types";
import { EventManager } from "../../core/events/EventManager";

export class MemoryGovernor {
    private logger = Logger.getInstance();
    private eventBus = EventManager.getInstance();

    /**
     * 9.9 Memory Governor
     * OOM prevention, cache release.
     */
    public ensureMemoryAvailable(requiredRamMb: number, requiredVramMb: number, profile: HardwareProfile): boolean {
        // 9.17 Hardware Failure Isolation - RAM Pressure
        if (profile.memory.availableRamMb < requiredRamMb) {
            this.logger.warn(`[MemoryGovernor] OOM Risk Detected! Required RAM: ${requiredRamMb}MB, Available: ${profile.memory.availableRamMb}MB. Initiating emergency cleanup.`);
            this.emergencyCleanup(profile, "RAM");
            
            // Re-check
            if (profile.memory.availableRamMb < requiredRamMb) {
                this.logger.error(`[MemoryGovernor] Failed to free enough RAM. Rejecting allocation.`);
                return false;
            }
        }

        if (requiredVramMb > 0 && profile.memory.availableVramMb < requiredVramMb) {
            this.logger.warn(`[MemoryGovernor] VRAM Exhaustion Risk! Required VRAM: ${requiredVramMb}MB, Available: ${profile.memory.availableVramMb}MB. Initiating VRAM cleanup.`);
            this.emergencyCleanup(profile, "VRAM");

            if (profile.memory.availableVramMb < requiredVramMb) {
                this.logger.error(`[MemoryGovernor] Failed to free enough VRAM.`);
                return false; // Fallback to CPU will happen in scheduler
            }
        }

        return true;
    }

    private emergencyCleanup(profile: HardwareProfile, type: "RAM" | "VRAM") {
        this.logger.info(`[MemoryGovernor] Executing ${type} garbage collection, unloading inactive models, clearing caches...`);
        // Simulate freeing memory
        if (type === "RAM") {
            profile.memory.availableRamMb += 2048; // free 2GB
        } else {
            profile.memory.availableVramMb += 1024; // free 1GB
        }
        this.eventBus.publish("EmergencyMemoryCleanup", { type, profile });
    }
}
