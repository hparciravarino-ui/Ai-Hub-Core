import { Logger, LogLevel } from "./Logger";

export function runTests(): boolean {
    console.log("[Logger Test] Running Logger unit tests...");
    const logger = Logger.getInstance();
    
    try {
        logger.setLevel(LogLevel.DEBUG);
        logger.debug("Test debug message");
        logger.info("Test info message");
        logger.warn("Test warning message");
        logger.error("Test error message", new Error("Simulated test error"));
        
        console.log("[Logger Test] All Logger unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Logger Test] Test failed: ${e.message}`);
        return false;
    }
}
