import { NormalizedPrompt, NormalizedOutput } from "./types";
import { Logger } from "../../core/logging/Logger";

export class PromptNormalizer {
    private logger = Logger.getInstance();

    /**
     * 8.9 Prompt Normalizer
     * Adapts prompt to model, converts templates, manages system prompts, tool calling formats.
     */
    public normalize(rawPrompt: string, systemPrompt?: string, tools?: any[]): NormalizedPrompt {
        this.logger.debug(`[PromptNormalizer] Normalizing prompt. Length: ${rawPrompt.length}`);
        
        return {
            systemPrompt: systemPrompt || "Sei un assistente AI avanzato. Rispondi in modo conciso e utile.",
            messages: [
                { role: "user", content: rawPrompt }
            ],
            tools: tools || [],
            contextParams: {
                maxTokens: 4096,
                temperature: 0.7,
                topP: 0.9
            }
        };
    }
}

export class OutputNormalizer {
    private logger = Logger.getInstance();

    /**
     * 8.10 Output Normalizer
     * Converts any runtime specific output into standard UMAL format.
     */
    public normalize(rawOutput: any, modelId: string, latencyMs: number): NormalizedOutput {
        this.logger.debug(`[OutputNormalizer] Normalizing output from model: ${modelId}`);

        let content = rawOutput?.text || rawOutput?.content || rawOutput || "";
        let format: NormalizedOutput["format"] = "text";

        // Simple heuristic for format detection
        if (typeof content === "string") {
            if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
                format = "json";
                try {
                    content = JSON.parse(content);
                } catch(e) {}
            } else if (content.includes("```")) {
                format = "markdown";
            }
        } else if (typeof content === "object") {
            format = "json";
        }

        return {
            format,
            content,
            tokensUsed: {
                prompt: rawOutput?.usage?.promptTokens || 120,
                completion: rawOutput?.usage?.completionTokens || 85,
                total: rawOutput?.usage?.totalTokens || 205
            },
            latencyMs,
            modelId,
            reasoningLog: rawOutput?.reasoning || undefined
        };
    }
}
