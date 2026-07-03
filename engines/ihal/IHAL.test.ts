import { IHAL } from "./IHAL";

export async function runTests(): Promise<boolean> {
    console.log("[IHAL Test] Initiating Intelligent Hardware Abstraction Layer tests...");
    const ihal = IHAL.getInstance();

    try {
        // 1. Test Profiler
        const profile = ihal.getAvailableResources();
        if (!profile || profile.arch !== "x86_64") {
            throw new Error("Profiler failed to return valid default profile.");
        }
        console.log(`[IHAL Test] Profiler initialized correctly. Current Mode: ${profile.mode}`);

        // 2. Test Load Predictor
        const prediction = ihal.loadPredictor.predictLoad("inference", 4000, 2048, profile);
        if (prediction.predictedRamMb <= 0 || prediction.predictedVramMb <= 0) {
            throw new Error("Load Predictor failed to calculate required memory.");
        }
        console.log(`[IHAL Test] Load Prediction successful. (RAM: ${prediction.predictedRamMb.toFixed(0)}MB, VRAM: ${prediction.predictedVramMb.toFixed(0)}MB)`);

        // 3. Test Memory Governor and Scheduler
        const req = {
            taskId: "test-task-1",
            requiredRamMb: 2000,
            requiredVramMb: 1000,
            preferredExecutionType: "GPU" as any,
            priority: "NORMAL" as any
        };
        
        const success = ihal.requestCompute(req);
        if (!success) {
            throw new Error("Scheduler failed to allocate resources for a standard request.");
        }
        console.log(`[IHAL Test] Resource Scheduler successfully allocated Task on GPU.`);
        
        // Release
        ihal.releaseCompute(req);

        // 4. Test Throttling / Battery Fallback Simulation
        ihal.profiler.setSimulatedState({ 
            power: { batteryState: "BATTERY", powerMode: "saver", batteryLevelPercent: 15 } 
        });
        
        const req2 = {
            taskId: "test-task-2",
            requiredRamMb: 1000,
            requiredVramMb: 1000,
            preferredExecutionType: "GPU" as any,
            priority: "NORMAL" as any
        };

        const success2 = ihal.requestCompute(req2);
        // It should fallback to CPU due to battery <= 20%
        if (!success2 || req2.preferredExecutionType !== "CPU") {
            throw new Error("Power awareness layer failed to fallback to CPU on low battery.");
        }
        console.log(`[IHAL Test] Power Awareness Layer successfully triggered CPU fallback on low battery.`);
        ihal.releaseCompute(req2);
        
        // Restore state
        ihal.profiler.setSimulatedState({ 
            power: { batteryState: "AC", powerMode: "balanced", batteryLevelPercent: 100 } 
        });

        // 5. Test Benchmark
        const bench = ihal.benchmarkHardware();
        if (!bench || !bench.throughputTokensSec) {
            throw new Error("Benchmark engine failed to produce metrics.");
        }
        console.log(`[IHAL Test] Hardware Benchmark completed (Latency: ${bench.latencyMs}ms).`);

        console.log("[IHAL Test] All IHAL unit tests executed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[IHAL Test] Test suite failed: ${e.message}`);
        return false;
    }
}
