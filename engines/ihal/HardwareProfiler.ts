import { Logger } from "../../core/logging/Logger";
import { HardwareProfile, ThermalCapabilities, PowerCapabilities, MemoryCapabilities, ComputeCapabilities, StorageCapabilities } from "./types";
import { EventManager } from "../../core/events/EventManager";

export class HardwareProfiler {
    private logger = Logger.getInstance();
    private eventBus = EventManager.getInstance();
    private profile: HardwareProfile;

    constructor() {
        // Initial simulated profile (Balanced)
        this.profile = {
            mode: "BALANCED",
            arch: "x86_64",
            compute: {
                singleThreadPerformance: 1200,
                multiThreadPerformance: 9500,
                vectorizationSupport: ["AVX2", "FMA"],
                gpuComputeUnits: 36,
                npuAvailable: false
            },
            memory: {
                totalRamMb: 16384,
                availableRamMb: 8192,
                memoryBandwidthGBs: 50,
                totalVramMb: 8192,
                availableVramMb: 4096
            },
            storage: {
                isSSD: true,
                readSpeedMBs: 3500,
                writeSpeedMBs: 3000,
                iops: 50000
            },
            thermal: {
                temperatureCelsius: 45,
                thermalThrottlingState: "NONE"
            },
            power: {
                batteryState: "AC",
                powerMode: "balanced",
                batteryLevelPercent: 100
            }
        };
    }

    /**
     * 9.6 Hardware Profiler
     * Continuous non-invasive profiling.
     */
    public pollHardwareState(): void {
        // Simulate minor fluctuations
        this.profile.memory.availableRamMb = Math.max(1024, this.profile.memory.availableRamMb + (Math.random() * 200 - 100));
        this.profile.memory.availableVramMb = Math.max(512, this.profile.memory.availableVramMb + (Math.random() * 100 - 50));
        this.profile.thermal.temperatureCelsius = Math.max(35, Math.min(95, this.profile.thermal.temperatureCelsius + (Math.random() * 4 - 2)));

        if (this.profile.thermal.temperatureCelsius > 85) {
            this.profile.thermal.thermalThrottlingState = "SEVERE";
        } else if (this.profile.thermal.temperatureCelsius > 75) {
            this.profile.thermal.thermalThrottlingState = "LIGHT";
        } else {
            this.profile.thermal.thermalThrottlingState = "NONE";
        }

        this.updateHardwareMode();

        // 9.20 Observability Event
        this.eventBus.publish("HardwareMetricsUpdated", this.profile);
    }

    private updateHardwareMode() {
        if (this.profile.memory.totalRamMb <= 8192 || this.profile.power.batteryState === "BATTERY") {
            this.profile.mode = "LOW_POWER";
        } else if (this.profile.memory.totalRamMb >= 32768 && this.profile.power.batteryState === "AC") {
            this.profile.mode = "HIGH_PERFORMANCE";
        } else {
            this.profile.mode = "BALANCED";
        }
    }

    public getProfile(): HardwareProfile {
        return this.profile;
    }

    public setSimulatedState(update: Partial<HardwareProfile>) {
        this.profile = { ...this.profile, ...update };
        this.updateHardwareMode();
        this.eventBus.publish("HardwareMetricsUpdated", this.profile);
    }
}
