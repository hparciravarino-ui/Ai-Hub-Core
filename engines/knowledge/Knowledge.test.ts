import { KnowledgeEngine } from "./KnowledgeEngine";

export async function runTests(): Promise<boolean> {
    console.log("[Knowledge Test] Running KnowledgeEngine unit tests...");
    const engine = new KnowledgeEngine();
    await engine.initialize();
    
    try {
        const status = engine.getStatus() as any;
        if (status.status !== "active") {
            throw new Error("Knowledge Engine should boot to active state.");
        }
        
        console.log("[Knowledge Test] All KnowledgeEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Knowledge Test] Test failed: ${e.message}`);
        return false;
    }
}
