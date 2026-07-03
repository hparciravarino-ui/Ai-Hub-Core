import { Logger } from "../../core/logging/Logger";

export class UniversalTokenManager {
    private logger = Logger.getInstance();

    /**
     * 8.15 Universal Token Manager
     * Uniforms token counting, limits, memory cost across runtimes.
     */
    public estimateTokenCount(text: string): number {
        // Simple heuristic: ~4 characters per token
        const estimate = Math.ceil(text.length / 4);
        return estimate;
    }

    public estimateMemoryCost(tokenCount: number, batchSize: number = 1): number {
        // Very rough heuristic for KV cache memory cost: 
        // 2 (bytes) * 2 (K & V) * num_layers * num_heads * head_dim * tokenCount * batchSize
        // Let's assume ~1MB per 1000 tokens as a generic baseline
        const mb = (tokenCount / 1000) * 1.5 * batchSize;
        return parseFloat(mb.toFixed(2));
    }

    public optimizeContext(messages: {role: string, content: string}[], maxTokens: number): {role: string, content: string}[] {
        let currentTokens = 0;
        const optimized = [];

        // Keep system message always
        const systemMsg = messages.find(m => m.role === "system");
        if (systemMsg) {
            currentTokens += this.estimateTokenCount(systemMsg.content);
            optimized.push(systemMsg);
        }

        // Add from newest to oldest
        const others = messages.filter(m => m.role !== "system").reverse();
        for (const msg of others) {
            const tokens = this.estimateTokenCount(msg.content);
            if (currentTokens + tokens > maxTokens) {
                this.logger.warn(`[UniversalTokenManager] Context limit reached. Truncating history.`);
                break;
            }
            currentTokens += tokens;
            optimized.unshift(msg);
        }

        return optimized;
    }
}
