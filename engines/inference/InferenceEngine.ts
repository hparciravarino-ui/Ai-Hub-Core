import { RuntimeManager } from "../runtime/RuntimeManager";
import { GeminiRuntime } from "../runtime/GeminiRuntime";
import { Logger } from "../../core/logging/Logger";

export interface IInferenceEngine {
    executeInference(prompt: string, modelId: string, history?: any[], systemInstruction?: string): Promise<string>;
}

export class InferenceEngine implements IInferenceEngine {
    private runtimeManager: RuntimeManager;
    private logger: Logger;

    constructor(runtimeManager: RuntimeManager) {
        this.runtimeManager = runtimeManager;
        this.logger = Logger.getInstance();
    }

    public async executeInference(prompt: string, modelId: string, history?: any[], systemInstruction?: string): Promise<string> {
        this.logger.info(`[Inference Engine] Routing query to model ${modelId}...`);
        
        let runtimeId = modelId;
        if (!this.runtimeManager.getRuntime(runtimeId)) {
            this.logger.warn(`[Inference Engine] Model runtime ${modelId} not configured. Falling back to default proxy...`);
            runtimeId = "core_engine_default";
        }

        const runtime = this.runtimeManager.getRuntime(runtimeId);
        if (!runtime || !runtime.isAvailable) {
            throw new Error(`Inference runtime ${modelId} is currently offline.`);
        }

        if ('generateText' in runtime) {
            return await (runtime as GeminiRuntime).generateText(prompt, history, systemInstruction);
        }
        
        return "⚠️ Error: Selected execution runtime does not support text synthesis.";
    }

    public getStatus(): object {
        const active = this.runtimeManager.getAvailableRuntimes().map(r => r.name);
        return {
            status: "active",
            availableRuntimes: active
        };
    }
}
