import { Logger } from "../../core/logging/Logger";
import { KnowledgeEngine } from "../knowledge/KnowledgeEngine";

export class RAGEngine {
    private logger: Logger;
    private knowledgeEngine: KnowledgeEngine;

    constructor(knowledgeEngine: KnowledgeEngine) {
        this.logger = Logger.getInstance();
        this.knowledgeEngine = knowledgeEngine;
    }

    public async augmentPrompt(userPrompt: string): Promise<{ augmentedPrompt: string; sources: string[] }> {
        this.logger.info(`[RAG Engine] Starting retrieval phase to augment prompt: "${userPrompt}"`);
        
        // 1. Semantic retrieval of documents
        const matchingDocs = await this.knowledgeEngine.query(userPrompt);
        
        if (matchingDocs.length === 0) {
            this.logger.info("[RAG Engine] No matching documents found. Continuing with raw prompt.");
            return { augmentedPrompt: userPrompt, sources: [] };
        }

        // 2. Synthesize context blocks
        const contextBlock = matchingDocs.join("\n\n");
        const augmentedPrompt = `You are a helpful software engineering assistant. Use the following matched local project documentation to answer the query accurately. Do not invent details.

---
LOCAL DOCUMENTS:
${contextBlock}
---

USER QUERY:
${userPrompt}`;

        this.logger.info(`[RAG Engine] Successfully augmented prompt with ${matchingDocs.length} local source document snippets.`);
        return { augmentedPrompt, sources: matchingDocs };
    }

    public getStatus(): object {
        return {
            status: "active",
            retrievalDepth: 3,
            reranking: "similarity-frequency"
        };
    }
}
