import { InferenceEngine } from "./InferenceEngine";
import { RuntimeManager } from "../runtime/RuntimeManager";

export async function runTests(): Promise<boolean> {
    console.log("[Inference Test] Running InferenceEngine unit tests...");
    const runtimeManager = new RuntimeManager();
    const inferenceEngine = new InferenceEngine(runtimeManager);
    
    try {
        const status = inferenceEngine.getStatus() as any;
        if (status.status !== "active") {
            throw new Error("Expected active status on Inference Engine initialization.");
        }
        
        console.log("[Inference Test] All InferenceEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Inference Test] Test failed: ${e.message}`);
        return false;
    }
}
