import { Logger } from "../logging/Logger";
import { RecoverySystem } from "../recovery/RecoverySystem";

export enum ErrorSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

export type ErrorCategory = "SYSTEM" | "DATABASE" | "AI" | "RUNTIME" | "PLUGIN" | "SECURITY" | "PERFORMANCE" | "UNKNOWN";

export class AppError extends Error {
    public readonly severity: ErrorSeverity;
    public readonly category: ErrorCategory;
    public readonly isOperational: boolean;
    public readonly errorCode: string;

    constructor(message: string, severity: ErrorSeverity, isOperational: boolean = true, category: ErrorCategory = "SYSTEM", errorCode: string = "ERR_GENERIC") {
        super(message);
        this.severity = severity;
        this.isOperational = isOperational;
        this.category = category;
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export interface IErrorHandler {
    handleError(error: Error | AppError, serviceName?: string): void;
    isTrustedError(error: Error): boolean;
    getSuggestedSolution(error: Error | AppError): string;
}

export class ErrorHandler implements IErrorHandler {
    private static instance: ErrorHandler;
    private logger: Logger;

    private constructor() {
        this.logger = Logger.getInstance();
    }

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    public handleError(error: Error | AppError, serviceName: string = "UnknownService"): void {
        const severity = error instanceof AppError ? error.severity : ErrorSeverity.HIGH;
        const category = error instanceof AppError ? error.category : "SYSTEM";
        const code = error instanceof AppError ? error.errorCode : "ERR_GENERIC";

        const logMeta = {
            module: "Lifecycle",
            service: "ErrorHandler",
            errorCode: code
        };

        if (severity === ErrorSeverity.CRITICAL) {
            this.logger.critical(`[ErrorHandler] [CRITICAL] [${category}] Service: ${serviceName} - Msg: ${error.message}`, error, logMeta);
            // Trigger emergency recovery system
            RecoverySystem.getInstance().attemptSelfRepair(serviceName, error);
        } else if (severity === ErrorSeverity.HIGH) {
            this.logger.error(`[ErrorHandler] [HIGH] [${category}] Service: ${serviceName} - Msg: ${error.message}`, error, logMeta);
            RecoverySystem.getInstance().attemptSelfRepair(serviceName, error);
        } else if (severity === ErrorSeverity.MEDIUM) {
            this.logger.warn(`[ErrorHandler] [MEDIUM] [${category}] Service: ${serviceName} - Msg: ${error.message}`, logMeta);
        } else {
            this.logger.debug(`[ErrorHandler] [LOW] [${category}] Service: ${serviceName} - Msg: ${error.message}`, logMeta);
        }
    }

    public isTrustedError(error: Error): boolean {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }

    public getSuggestedSolution(error: Error | AppError): string {
        if (error instanceof AppError) {
            switch (error.errorCode) {
                case "ERR_CONFIG_INVALID":
                    return "Rollback last configuration modifications or check config properties syntax.";
                case "ERR_DB_LOCKED":
                    return "Reset the WAL database journal mode or clear concurrent sqlite handles.";
                case "ERR_RUNTIME_TIMEOUT":
                    return "Increase the execution timeout limit in Runtime configurations.";
                case "ERR_OUT_OF_MEMORY":
                    return "Enable Low-Memory performance mode or clear cache.";
                case "ERR_SANDBOX_VIOLATION":
                    return "Check plugin permission scopes and audit security certificates.";
                default:
                    return "Verify service status inside ServiceRegistry and consult active logger streams.";
            }
        }
        return "Check process logs and verify if physical memory/space is exhausted.";
    }
}
