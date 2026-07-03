import { DigitalBrain } from "./DigitalBrain";

export async function runTests(): Promise<boolean> {
    console.log("[Digital Brain Test] Running DigitalBrain unit tests...");
    const brain = new DigitalBrain();
    await brain.initialize();
    
    try {
        brain.logDecision("Bootstrap core", "System is starting up from scratch");
        const history = brain.getDecisionHistory();
        if (history.length !== 1 || history[0].action !== "Bootstrap core") {
            throw new Error("Failed to register decision log entry.");
        }
        
        brain.updatePreference({ theme: "dracula" });
        if (brain.getPreferences().theme !== "dracula") {
            throw new Error("Failed to sync preference updates.");
        }
        
        console.log("[Digital Brain Test] All DigitalBrain unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Digital Brain Test] Test failed: ${e.message}`);
        return false;
    }
}
