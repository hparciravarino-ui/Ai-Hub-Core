import { HardwareEngine } from "./HardwareEngine";

export function runTests(): boolean {
    console.log("[Hardware Test] Running HardwareEngine unit tests...");
    const engine = HardwareEngine.getInstance();
    
    try {
        const telemetry = engine.getLatestTelemetry();
        if (telemetry.cpuLoad < 0 || telemetry.ramTotalBytes <= 0) {
            throw new Error("Invalid hardware telemetry values gathered.");
        }
        
        console.log(`[Hardware Test] CPU Load: ${telemetry.cpuLoad}%, RAM Total: ${(telemetry.ramTotalBytes / 1024 / 1024 / 1024).toFixed(1)} GB`);
        console.log("[Hardware Test] All HardwareEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Hardware Test] Test failed: ${e.message}`);
        return false;
    }
}
