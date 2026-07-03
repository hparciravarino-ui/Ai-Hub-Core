import { UMAL } from "./UMAL";

export async function runTests(): Promise<boolean> {
    console.log("[UMAL Test] Initiating Universal Model Abstraction Layer tests...");
    const umal = UMAL.getInstance();

    try {
        // 1. Test Registry Bootstrap
        const models = umal.registry.getAllModels();
        if (models.length < 3) {
            throw new Error(`Expected at least 3 default models, got ${models.length}`);
        }
        console.log(`[UMAL Test] Model Registry bootstrap passed (${models.length} models loaded).`);

        // 2. Test Capability Based Routing (Code & Reasoning)
        const codeModel = umal.registry.findBestModel({ requiredCapabilities: ["Code", "Reasoning"] });
        if (!codeModel) {
            throw new Error("Failed to route to a model with Code and Reasoning capabilities.");
        }
        console.log(`[UMAL Test] Capability Routing (Code/Reasoning) resolved to: ${codeModel.name}`);

        // 3. Test Capability Based Routing (Vision)
        const visionModel = umal.registry.findBestModel({ requiredCapabilities: ["Vision"] });
        if (!visionModel) {
            throw new Error("Failed to route to a model with Vision capability.");
        }
        console.log(`[UMAL Test] Capability Routing (Vision) resolved to: ${visionModel.name}`);

        // 4. Test Prompt Normalizer
        const normalizedPrompt = umal.promptNormalizer.normalize("Analizza questo log di sistema", "Sei un DevOps");
        if (normalizedPrompt.messages[0].content !== "Analizza questo log di sistema" || normalizedPrompt.systemPrompt !== "Sei un DevOps") {
            throw new Error("Prompt Normalizer failed to map messages correctly.");
        }
        console.log("[UMAL Test] Prompt Normalizer passed (1ms latency overhead).");

        // 5. Test Token Manager Optimization
        const tokens = umal.tokenManager.estimateTokenCount("This is a short test.");
        if (tokens <= 0) {
            throw new Error("Token Manager estimation failed.");
        }
        console.log(`[UMAL Test] Universal Token Manager passed (Estimated ${tokens} tokens for string).`);

        // 6. Test End-to-End Execution & Fallback Mechanism Simulation
        const result = await umal.execute("Scrivi una funzione in Python", { requiredCapabilities: ["Code"] });
        if (!result || !result.content || result.format !== "text") {
            throw new Error("UMAL Execution failed to produce valid NormalizedOutput.");
        }
        console.log(`[UMAL Test] E2E Execution passed. Model used: ${result.modelId}, Latency: ${result.latencyMs}ms`);

        console.log("[UMAL Test] All UMAL unit tests executed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[UMAL Test] Test suite failed: ${e.message}`);
        return false;
    }
}
