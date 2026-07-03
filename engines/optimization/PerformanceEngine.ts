import { Logger } from "../../core/logging/Logger";
import { EventManager } from "../../core/events/EventManager";
import { HardwareTelemetry } from "../hardware/HardwareEngine";

export interface OptimizationProfile {
    threadCount: number;
    cacheSizeLimitMb: number;
    threadPriority: "idle" | "below_normal" | "normal" | "high";
    enableStreaming: boolean;
    compressionEnabled: boolean;
    prefetchBufferCount: number;
    lowMemoryMode: boolean;
}

export class PerformanceEngine {
    private static instance: PerformanceEngine;
    private logger: Logger;
    private eventManager: EventManager;
    private currentProfile!: OptimizationProfile;

    private constructor() {
        this.logger = Logger.getInstance();
        this.eventManager = EventManager.getInstance();
        
        // Default conservative baseline profile (optimized for 8GB machine)
        this.currentProfile = {
            threadCount: 4,
            cacheSizeLimitMb: 512,
            threadPriority: "normal",
            enableStreaming: true,
            compressionEnabled: true,
            prefetchBufferCount: 2,
            lowMemoryMode: true
        };

        // Listen to continuous hardware updates to dynamically optimize the system
        this.eventManager.subscribe("hardware_telemetry_updated", (telemetry: HardwareTelemetry) => {
            this.optimizeSystem(telemetry);
        });
    }

    public static getInstance(): PerformanceEngine {
        if (!PerformanceEngine.instance) {
            PerformanceEngine.instance = new PerformanceEngine();
        }
        return PerformanceEngine.instance;
    }

    private optimizeSystem(telemetry: HardwareTelemetry): void {
        const totalRamGb = telemetry.ramTotalBytes / 1024 / 1024 / 1024;
        const freeRamGb = (telemetry.ramTotalBytes - telemetry.ramUsedBytes) / 1024 / 1024 / 1024;

        let threadCount = 4;
        let cacheSizeLimitMb = 512;
        let threadPriority: OptimizationProfile["threadPriority"] = "normal";
        let lowMemoryMode = false;

        // Dynamic optimization logic based on hardware footprint
        if (totalRamGb <= 8 || freeRamGb < 2) {
            // Highly constrained hardware (e.g. 8GB Laptop)
            threadCount = 2; // Keep threads low to prevent context switching overhead and heat
            cacheSizeLimitMb = 128; // Strict memory cap
            threadPriority = "below_normal";
            lowMemoryMode = true;
        } else if (totalRamGb > 16) {
            // High-end workstation
            threadCount = 8;
            cacheSizeLimitMb = 2048;
            threadPriority = "high";
        }

        const newProfile: OptimizationProfile = {
            threadCount,
            cacheSizeLimitMb,
            threadPriority,
            enableStreaming: true,
            compressionEnabled: lowMemoryMode, // Compress memory streams on low hardware
            prefetchBufferCount: lowMemoryMode ? 1 : 4,
            lowMemoryMode
        };

        const changed = JSON.stringify(this.currentProfile) !== JSON.stringify(newProfile);
        this.currentProfile = newProfile;

        if (changed) {
            this.logger.info(`[Performance Engine] Dynamic optimization adjusted. Low-Memory-Mode: ${lowMemoryMode}, Threads: ${threadCount}`);
            this.eventManager.publish("performance_profile_changed", this.currentProfile);
        }
    }

    public getCurrentProfile(): OptimizationProfile {
        return this.currentProfile;
    }

    public getStatus(): object {
        return {
            status: "active",
            currentProfile: this.currentProfile
        };
    }
}
