import { MemoryEngine } from "./MemoryEngine";

export async function runTests(): Promise<boolean> {
    console.log("[Memory Test] Running MemoryEngine unit tests...");
    const engine = new MemoryEngine();
    await engine.initialize();
    
    try {
        const status = engine.getStatus() as any;
        if (status.status !== "active" || !status.heapUsed) {
            throw new Error("Memory diagnostics properties missed.");
        }
        
        engine.flushCache();
        console.log("[Memory Test] All MemoryEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Memory Test] Test failed: ${e.message}`);
        return false;
    }
}
