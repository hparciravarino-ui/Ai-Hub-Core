import { Kernel } from "./Kernel";

export async function runTests(): Promise<boolean> {
    console.log("[Kernel Test] Running Kernel unit tests...");
    const kernel = Kernel.getInstance();
    
    try {
        await kernel.bootstrap();
        const status = kernel.getStatus() as any;
        
        if (status.status !== "online" || !status.initialized) {
            throw new Error("Kernel failed to transition to online status.");
        }
        
        if (status.subsystems.configManager !== "active") {
            throw new Error("Core subsystems not bound properly inside Kernel status.");
        }
        
        console.log("[Kernel Test] All Kernel unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Kernel Test] Test failed: ${e.message}`);
        return false;
    }
}
