import { DIContainer } from "./Container";

export function runTests(): boolean {
    console.log("[DI Test] Running DIContainer unit tests...");
    const container = DIContainer.getInstance();
    container.clear();
    
    try {
        const mockService = { name: "MockService", execute: () => "OK" };
        container.register("mock", mockService);
        
        const resolved = container.resolve<typeof mockService>("mock");
        if (resolved.execute() !== "OK") {
            throw new Error("Resolved service execution failed.");
        }
        
        console.log("[DI Test] All DIContainer unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[DI Test] Test failed: ${e.message}`);
        return false;
    }
}
