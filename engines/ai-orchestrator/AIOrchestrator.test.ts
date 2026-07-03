import { AIOrchestrator, OrchestrationTask } from "./AIOrchestrator";

export async function runTests(): Promise<boolean> {
    console.log("[Orchestration Test] Running expanded AIOrchestrator unit tests...");
    
    try {
        const orchestrator = AIOrchestrator.getInstance();

        // 1. Singleton instantiation
        if (!orchestrator) {
            throw new Error("AIOrchestrator failed to load instance.");
        }

        // 2. Models registry check (No Lock-In)
        const models = orchestrator.getAvailableModels();
        if (models.length < 5) {
            throw new Error(`Expected at least 5 standard models for diverse task handling. Found: ${models.length}`);
        }

        // 3. 6.6 Request Intelligent Router / Auto-classification
        const codePrompt = "Scrivi un codice in TypeScript per una coda asincrona di priorità.";
        const category = orchestrator.autoClassifyRequest(codePrompt);
        if (category !== "Programmazione") {
            throw new Error(`Classification error. Expected 'Programmazione' but got: ${category}`);
        }

        const ragPrompt = "Cerca nel database vettoriale RAG i documenti sul bug di cache.";
        const categoryRag = orchestrator.autoClassifyRequest(ragPrompt);
        if (categoryRag !== "RAG") {
            throw new Error(`Classification error. Expected 'RAG' but got: ${categoryRag}`);
        }

        // 4. Output Self-Verification
        const validOutput = "export class SchedulerQueue { private jobs: any[] = []; }";
        const checkValid = orchestrator.verifyAIOutput(validOutput);
        if (!checkValid.passes) {
            throw new Error("Standard clean code failed self-verification check.");
        }

        const invalidOutput = "TODO: implement_mock_here as dynamic callback.";
        const checkInvalid = orchestrator.verifyAIOutput(invalidOutput);
        if (checkInvalid.passes) {
            throw new Error("Output containing incomplete mock patterns should fail verification.");
        }

        // 5. Task execution simulation (High Priority with scheduler queue)
        const task: OrchestrationTask = {
            id: "task-test-01",
            description: "Analisi di codice ridondante",
            category: "Programmazione",
            priority: "Alta",
            timeoutMs: 5000,
            contextLevel: "Progetto",
            payload: {
                prompt: "Ottimizza il ciclo di scansione del filesystem."
            }
        };

        const result = await orchestrator.orchestrateTask(task);
        if (result.status !== "completed") {
            throw new Error(`Orchestration task failed. Status: ${result.status}`);
        }
        if (!result.output.includes("[Inference Output]")) {
            throw new Error("Result output does not include standard simulated framework format.");
        }

        // 6. Consensus Engine check
        const consensusResult = orchestrator.executeConsensusEngine("Verifica coerenza logica del compilatore.");
        if (consensusResult.overall < 90 || !consensusResult.response.includes("[Candidate A]")) {
            throw new Error("Consensus algorithm returned invalid winner response.");
        }

        // 7. Dynamic Telemetry KPIs
        const kpis = orchestrator.getRealtimeKPIs() as any;
        if (kpis.totalInferencesProcessed !== 1) {
            throw new Error(`Telemetry failed to increment executed tasks count. Found: ${kpis.totalInferencesProcessed}`);
        }

        // 8. Space Traceability Matrix check
        const matrix = orchestrator.getChapter6TraceabilityMatrix();
        if (matrix.length === 0 || matrix[0].id !== "REQ-06-01") {
            throw new Error("Traceability matrix of Chapter 6 was not compiled correctly.");
        }

        console.log("[Orchestration Test] All AIOrchestrator unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Orchestration Test Failed] Error: ${e.message}`);
        return false;
    }
}
