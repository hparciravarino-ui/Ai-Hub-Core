import { Logger } from "../../core/logging/Logger";
import { HardwareProfiler } from "./HardwareProfiler";
import { LoadPredictionEngine } from "./LoadPredictionEngine";
import { MemoryGovernor } from "./MemoryGovernor";
import { ResourceScheduler } from "./ResourceScheduler";
import { HardwareProfile, ResourceAllocationRequest, LoadPrediction } from "./types";

export class IHAL {
    private static instance: IHAL;
    public profiler: HardwareProfiler;
    public loadPredictor: LoadPredictionEngine;
    public memoryGovernor: MemoryGovernor;
    public scheduler: ResourceScheduler;
    private logger = Logger.getInstance();

    private constructor() {
        this.profiler = new HardwareProfiler();
        this.loadPredictor = new LoadPredictionEngine();
        this.memoryGovernor = new MemoryGovernor();
        this.scheduler = new ResourceScheduler();
        
        // Start background profiling
        setInterval(() => this.profiler.pollHardwareState(), 5000);
    }

    public static getInstance(): IHAL {
        if (!IHAL.instance) {
            IHAL.instance = new IHAL();
        }
        return IHAL.instance;
    }

    /**
     * 9.14 Hardware Abstraction API
     */

    public requestCompute(request: ResourceAllocationRequest): boolean {
        const profile = this.profiler.getProfile();
        
        // 1. Check memory via Governor
        const canAllocate = this.memoryGovernor.ensureMemoryAvailable(request.requiredRamMb, request.requiredVramMb || 0, profile);
        if (!canAllocate) {
            return false;
        }

        // 2. Schedule via Scheduler
        return this.scheduler.scheduleTask(request, profile);
    }

    public releaseCompute(request: ResourceAllocationRequest): void {
        const profile = this.profiler.getProfile();
        this.scheduler.releaseResources(request, profile);
    }

    public getAvailableResources(): HardwareProfile {
        return this.profiler.getProfile();
    }

    public benchmarkHardware(): any {
        this.logger.info(`[IHAL] Running hardware benchmark suite (9.18)`);
        // Simulate benchmark
        const result = {
            latencyMs: 15,
            throughputTokensSec: 45,
            memoryBandwidthGBs: this.profiler.getProfile().memory.memoryBandwidthGBs
        };
        this.logger.debug(`[IHAL] Benchmark complete. Result: ${JSON.stringify(result)}`);
        return result;
    }

    public switchExecutionMode(mode: HardwareProfile["mode"]): void {
        this.logger.info(`[IHAL] Forcing execution mode to: ${mode}`);
        this.profiler.setSimulatedState({ mode });
    }
}
