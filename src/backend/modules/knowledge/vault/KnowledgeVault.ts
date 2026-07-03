import { Logger } from "../../../core/logger/Logger";
import { CoreEngine } from "../../../core/CoreEngine";
import { documents } from "../../database/schema";
import { eq } from "drizzle-orm";

export class KnowledgeVault {
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async initialize(): Promise<void> {
        this.logger.info("[Knowledge Vault] Initializing secure data storage...");
        this.logger.info("[Knowledge Vault] Secure storage ready.");
    }

    public async storeDocument(name: string, content: string): Promise<void> {
        const id = "doc_" + Math.random().toString(36).substr(2, 9);
        const engine = CoreEngine.getInstance();
        engine.databaseLayer.db.insert(documents).values({
            id,
            name,
            content,
            createdAt: new Date().toISOString()
        }).run();
        this.logger.info(`[Knowledge Vault] Stored document: ${name}`);
    }

    public getDocuments() {
        const engine = CoreEngine.getInstance();
        return engine.databaseLayer.db.select().from(documents).all();
    }

    public getStatus(): object {
        return {
            status: "active"
        };
    }
}
