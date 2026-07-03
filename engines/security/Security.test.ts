import { SecurityEngine } from "./SecurityEngine";
import crypto from "crypto";

export async function runTests(): Promise<boolean> {
    console.log("[Security Test] Running SecurityEngine unit tests...");
    const engine = new SecurityEngine();
    await engine.initialize();
    
    try {
        const pass = engine.auditOperation("plugin_untrusted", "file_write_absolute", "/etc/passwd");
        if (pass) {
            throw new Error("Security Engine allowed untrusted plugin to run a forbidden absolute write.");
        }
        
        const content = "my_model_file";
        const expectedHash = crypto.createHash("sha256").update(content).digest("hex");
        const isValid = engine.verifyChecksum(content, expectedHash);
        
        if (!isValid) {
            throw new Error("Cryptographic verification of matching checksum failed.");
        }
        
        console.log("[Security Test] All SecurityEngine unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Security Test] Test failed: ${e.message}`);
        return false;
    }
}

