import { RuntimeManager } from "./RuntimeManager";
import { GeminiRuntime } from "./GeminiRuntime";

export async function runTests(): Promise<boolean> {
    console.log("[Runtime Test] Running RuntimeManager unit tests...");
    const manager = new RuntimeManager();
    const gemini = new GeminiRuntime();
    
    try {
        manager.registerRuntime(gemini);
        const fetched = manager.getRuntime(gemini.id);
        
        if (!fetched || fetched.name !== gemini.name) {
            throw new Error("Failed to register or resolve runtime plugin.");
        }
        
        console.log("[Runtime Test] All RuntimeManager unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Runtime Test] Test failed: ${e.message}`);
        return false;
    }
}
