/**
 * Error Handling Engine
 * Centralized error management and classification.
 */

import { Logger } from "../logger/Logger";

export enum ErrorSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

export class AppError extends Error {
    public readonly severity: ErrorSeverity;
    public readonly isOperational: boolean;

    constructor(message: string, severity: ErrorSeverity, isOperational: boolean = true) {
        super(message);
        this.severity = severity;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class ErrorHandler {
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

    public handleError(error: Error | AppError): void {
        if (error instanceof AppError) {
            if (error.severity === ErrorSeverity.CRITICAL) {
                this.logger.critical(error.message, error.stack);
            } else if (error.severity === ErrorSeverity.HIGH) {
                this.logger.error(error.message, error.stack);
            } else {
                this.logger.warn(error.message, error.stack);
            }
        } else {
            this.logger.error(error.message, error.stack);
        }
    }

    public isTrustedError(error: Error): boolean {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }
}
