/**
 * Logging Engine
 * Centralized logging system.
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
    CRITICAL = 4
}

export class Logger {
    private static instance: Logger;
    private currentLevel: LogLevel = LogLevel.INFO;

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }

    public debug(message: string, meta?: any): void {
        if (this.currentLevel <= LogLevel.DEBUG) {
            console.debug(this.formatMessage("DEBUG", message), meta || "");
        }
    }

    public info(message: string, meta?: any): void {
        if (this.currentLevel <= LogLevel.INFO) {
            console.info(this.formatMessage("INFO", message), meta || "");
        }
    }

    public warn(message: string, meta?: any): void {
        if (this.currentLevel <= LogLevel.WARNING) {
            console.warn(this.formatMessage("WARNING", message), meta || "");
        }
    }

    public error(message: string, error?: Error | any): void {
        if (this.currentLevel <= LogLevel.ERROR) {
            console.error(this.formatMessage("ERROR", message), error || "");
        }
    }

    public critical(message: string, error?: Error | any): void {
        if (this.currentLevel <= LogLevel.CRITICAL) {
            console.error(this.formatMessage("CRITICAL", message), error || "");
            // In a real system, this might trigger immediate alerts
        }
    }
}
