export enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARNING = 3,
    ERROR = 4,
    CRITICAL = 5
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    service: string;
    user?: string;
    workspace?: string;
    thread?: string;
    duration?: number;
    message: string;
    errorCode?: string;
    correlationId?: string;
    errorStack?: string;
}

export interface ILogger {
    trace(message: string, meta?: Partial<LogEntry>): void;
    debug(message: string, meta?: Partial<LogEntry>): void;
    info(message: string, meta?: Partial<LogEntry>): void;
    warn(message: string, meta?: Partial<LogEntry>): void;
    error(message: string, error?: any, meta?: Partial<LogEntry>): void;
    critical(message: string, error?: any, meta?: Partial<LogEntry>): void;
    searchLogs(criteria: {
        level?: LogLevel;
        module?: string;
        service?: string;
        text?: string;
        correlationId?: string;
    }): LogEntry[];
}

export class Logger implements ILogger {
    private static instance: Logger;
    private currentLevel: LogLevel = LogLevel.INFO;
    private logBuffer: LogEntry[] = [];
    private maxBufferSize: number = 2000;

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

    private formatMessage(entry: LogEntry): string {
        const parts = [
            `[${entry.timestamp}]`,
            `[${LogLevel[entry.level]}]`,
            `[${entry.module || "SYSTEM"}:${entry.service || "CORE"}]`
        ];
        if (entry.correlationId) parts.push(`(cid:${entry.correlationId})`);
        if (entry.duration !== undefined) parts.push(`(${entry.duration}ms)`);
        parts.push(entry.message);
        return parts.join(" ");
    }

    private log(level: LogLevel, message: string, errorOrMeta?: any, metaParam?: Partial<LogEntry>): void {
        const isErrorLevel = level >= LogLevel.ERROR;
        const meta = isErrorLevel ? (metaParam || {}) : (errorOrMeta || {});
        const errorStack = isErrorLevel && errorOrMeta ? (errorOrMeta.stack || String(errorOrMeta)) : undefined;
        const errorCode = isErrorLevel && errorOrMeta && errorOrMeta.code ? String(errorOrMeta.code) : meta.errorCode;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            module: meta.module || "Kernel",
            service: meta.service || "Core",
            user: meta.user || process.env.USER || "anonymous",
            workspace: meta.workspace || process.cwd(),
            thread: meta.thread || "main",
            duration: meta.duration,
            message,
            errorCode,
            correlationId: meta.correlationId || "cid_" + Math.random().toString(36).substring(2, 10),
            errorStack
        };

        // Save to in-memory searchable buffer
        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift(); // Keep buffer bounded to prevent memory leaks
        }

        // Print to console based on configured level
        if (level >= this.currentLevel) {
            const formatted = this.formatMessage(entry);
            if (level === LogLevel.TRACE || level === LogLevel.DEBUG) {
                console.debug(formatted);
            } else if (level === LogLevel.INFO) {
                console.info(formatted);
            } else if (level === LogLevel.WARNING) {
                console.warn(formatted);
            } else {
                console.error(formatted, errorStack || "");
            }
        }
    }

    public trace(message: string, meta?: Partial<LogEntry>): void {
        this.log(LogLevel.TRACE, message, meta);
    }

    public debug(message: string, meta?: Partial<LogEntry>): void {
        this.log(LogLevel.DEBUG, message, meta);
    }

    public info(message: string, meta?: Partial<LogEntry>): void {
        this.log(LogLevel.INFO, message, meta);
    }

    public warn(message: string, meta?: Partial<LogEntry>): void {
        this.log(LogLevel.WARNING, message, meta);
    }

    public error(message: string, error?: any, meta?: Partial<LogEntry>): void {
        this.log(LogLevel.ERROR, message, error, meta);
    }

    public critical(message: string, error?: any, meta?: Partial<LogEntry>): void {
        this.log(LogLevel.CRITICAL, message, error, meta);
    }

    public searchLogs(criteria: {
        level?: LogLevel;
        module?: string;
        service?: string;
        text?: string;
        correlationId?: string;
    }): LogEntry[] {
        return this.logBuffer.filter(entry => {
            if (criteria.level !== undefined && entry.level !== criteria.level) return false;
            if (criteria.module && !entry.module.toLowerCase().includes(criteria.module.toLowerCase())) return false;
            if (criteria.service && !entry.service.toLowerCase().includes(criteria.service.toLowerCase())) return false;
            if (criteria.correlationId && entry.correlationId !== criteria.correlationId) return false;
            if (criteria.text && !entry.message.toLowerCase().includes(criteria.text.toLowerCase()) && 
                !(entry.errorStack && entry.errorStack.toLowerCase().includes(criteria.text.toLowerCase()))) return false;
            return true;
        });
    }

    public clearBuffer(): void {
        this.logBuffer = [];
    }
}
