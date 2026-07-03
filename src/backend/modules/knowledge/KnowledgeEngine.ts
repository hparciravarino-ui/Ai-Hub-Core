/**
 * Knowledge Engine & Project Analyzer
 * Reads files, analyzes folders, indexes repositories into the Knowledge Base.
 */

import { Logger } from "../../core/logger/Logger";
import { ProjectAnalyzerEngine } from "./analyzer/ProjectAnalyzer";
import { KnowledgeVault } from "./vault/KnowledgeVault";
import { KnowledgeGraph } from "./graph/KnowledgeGraph";
import { VectorDatabase } from "./vector/VectorDatabase";

export class KnowledgeEngine {
    public analyzer: ProjectAnalyzerEngine;
    public vault: KnowledgeVault;
    public graph: KnowledgeGraph;
    public vectorDb: VectorDatabase;
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
        this.logger.info("[Knowledge Engine] Initialized.");
        this.analyzer = new ProjectAnalyzerEngine();
        this.vault = new KnowledgeVault();
        this.graph = new KnowledgeGraph();
        this.vectorDb = new VectorDatabase();
    }

    public async initialize(): Promise<void> {
        await this.analyzer.initialize();
        await this.vault.initialize();
        await this.graph.initialize();
        await this.vectorDb.initialize();
        this.logger.info("[Knowledge Engine] All subsystems initialized.");
    }

    public async query(queryText: string): Promise<string[]> {
        this.logger.info(`[Knowledge Engine] Querying Vault for: ${queryText}`);
        const docs = this.vault.getDocuments();
        const results: string[] = [];
        
        // Basic full-text search simulation for Phase 2
        for (const doc of docs) {
            if (doc.content.toLowerCase().includes(queryText.toLowerCase())) {
                results.push(doc.content.substring(0, 500) + "...");
            }
        }
        
        if (results.length === 0 && docs.length > 0) {
            results.push("Nessuna corrispondenza esatta trovata, ma ho analizzato " + docs.length + " documenti.");
        }
        
        return results;
    }

    public getStatus(): object {
        return {
            status: "active",
            subsystems: {
                analyzer: this.analyzer.getStatus(),
                vault: this.vault.getStatus(),
                graph: this.graph.getStatus(),
                vectorDb: this.vectorDb.getStatus()
            }
        };
    }
}

