/**
 * Runtime Manager
 * Manages the lifecycle and execution of local AI runtimes (e.g., llama.cpp, MLX).
 */

import { GeminiRuntime } from "./GeminiRuntime";
import { Logger } from "../../core/logger/Logger";

export interface IRuntime {
    id: string;
    name: string;
    isAvailable: boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
}

export class RuntimeManager {
    private runtimes: Map<string, IRuntime> = new Map();
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public registerRuntime(runtime: IRuntime) {
        this.runtimes.set(runtime.id, runtime);
        this.logger.info(`[Runtime Manager] Registered runtime: ${runtime.name}`);
    }

    public getAvailableRuntimes(): IRuntime[] {
        return Array.from(this.runtimes.values()).filter(r => r.isAvailable);
    }

    public getRuntime(id: string): IRuntime | undefined {
        return this.runtimes.get(id);
    }

    public async startRuntime(id: string): Promise<void> {
        const runtime = this.runtimes.get(id);
        if (!runtime) {
            throw new Error(`Runtime ${id} not found.`);
        }
        await runtime.start();
    }
}

