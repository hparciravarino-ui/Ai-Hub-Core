import { Logger } from "../../core/logging/Logger";

export class NotificationService {
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async sendAlert(title: string, message: string): Promise<void> {
        this.logger.info(`[Notification Service] Dispatching system notification alert: [${title}] ${message}`);
    }

    public getStatus(): object {
        return { status: "active", dispatchMode: "console-and-event" };
    }
}
