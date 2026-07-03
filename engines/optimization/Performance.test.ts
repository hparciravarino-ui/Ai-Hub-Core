import { PerformanceEngine } from "./PerformanceEngine";

export function runTests(): boolean {
    console.log("[Performance Test] Running PerformanceEngine unit tests...");
    const engine = PerformanceEngine.getInstance();
    
    try {
        const profile = engine.getCurrentProfile();
        if (profile.threadCount <= 0 || profile.cacheSizeLimitMb <= 0) {
            throw new Error("Invalid optimization profile preset loaded.");
        }
        
        console.log(`[Performance Test] Low-Memory Mode active: ${profile.lowMemoryMode}, Threads: ${profile.threadCount}`);
        console.log("[Performance Test] All PerformanceEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Performance Test] Test failed: ${e.message}`);
        return false;
    }
}
