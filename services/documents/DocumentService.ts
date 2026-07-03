import { Logger } from "../../core/logging/Logger";

export class DocumentService {
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async extractText(filePath: string): Promise<string> {
        this.logger.info(`[Document Service] Extracting document structure for file at: ${filePath}`);
        return `Extracted metadata for document: ${filePath}`;
    }

    public getStatus(): object {
        return { status: "active", supportedTypes: ["txt", "md", "pdf", "json"] };
    }
}
