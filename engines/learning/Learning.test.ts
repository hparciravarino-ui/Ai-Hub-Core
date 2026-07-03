import { LearningEngine } from "./LearningEngine";

export async function runTests(): Promise<boolean> {
    console.log("[Learning Test] Running LearningEngine unit tests...");
    const engine = new LearningEngine();
    await engine.initialize();
    
    try {
        const status = engine.getStatus() as any;
        if (status.status !== "active") {
            throw new Error("Learning Engine should initialize as active.");
        }
        
        console.log("[Learning Test] All LearningEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Learning Test] Test failed: ${e.message}`);
        return false;
    }
}
