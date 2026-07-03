import { RuntimeManager } from "../runtime/RuntimeManager";
import { GeminiRuntime } from "../runtime/GeminiRuntime";
import { Logger } from "../../core/logger/Logger";

/**
 * Inference Engine
 * Delegates inference requests to the active runtime.
 */

export class InferenceEngine {
    private runtimeManager: RuntimeManager;
    private logger: Logger;

    constructor(runtimeManager: RuntimeManager) {
        this.runtimeManager = runtimeManager;
        this.logger = Logger.getInstance();
        this.logger.info("[Inference Engine] Initialized.");
    }

    public async executeInference(prompt: string, modelId: string, history?: any[], systemInstruction?: string): Promise<string> {
        this.logger.info(`[Inference Engine] Executing inference for model ${modelId}...`);
        
        let runtimeId = modelId;
        // Map local models to the proxy if they are not real yet
        if (!this.runtimeManager.getRuntime(runtimeId)) {
            this.logger.warn(`[Inference Engine] Runtime ${modelId} not found, falling back to core_engine_default...`);
            runtimeId = "core_engine_default";
        }

        const runtime = this.runtimeManager.getRuntime(runtimeId);
        if (!runtime || !runtime.isAvailable) {
            throw new Error(`Nessun runtime disponibile per ${modelId}. Assicurati che il backend proxy sia configurato correttamente.`);
        }

        // Check if it's the GeminiRuntime which implements generateText
        if ('generateText' in runtime) {
            return await (runtime as GeminiRuntime).generateText(prompt, history, systemInstruction);
        }
        
        return "⚠️ Errore: il runtime selezionato non supporta la generazione del testo.";
    }
}

