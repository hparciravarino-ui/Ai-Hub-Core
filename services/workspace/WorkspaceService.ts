import { Logger } from "../../core/logging/Logger";

export class WorkspaceService {
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async registerWorkspace(path: string): Promise<void> {
        this.logger.info(`[Workspace Service] Binding system focus to directory: ${path}`);
    }

    public getStatus(): object {
        return { status: "active", activeWorkspace: "." };
    }
}
