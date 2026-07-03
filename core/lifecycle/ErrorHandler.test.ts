import { ErrorHandler, AppError, ErrorSeverity } from "./ErrorHandler";

export function runTests(): boolean {
    console.log("[Lifecycle Test] Running ErrorHandler unit tests...");
    const errorHandler = ErrorHandler.getInstance();
    
    try {
        const testError = new AppError("Simulated operational issue", ErrorSeverity.LOW, true);
        if (!errorHandler.isTrustedError(testError)) {
            throw new Error("Operational error was not recognized as trusted.");
        }
        
        const systemError = new Error("Generic system glitch");
        if (errorHandler.isTrustedError(systemError)) {
            throw new Error("Raw Error instance incorrectly classified as trusted operational error.");
        }
        
        console.log("[Lifecycle Test] All ErrorHandler unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Lifecycle Test] Test failed: ${e.message}`);
        return false;
    }
}
