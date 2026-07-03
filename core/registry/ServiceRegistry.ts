import { Logger } from "../logging/Logger";

export type ServiceState = "Running" | "Starting" | "Stopping" | "Failed" | "Paused" | "Recovering" | "Restarting";

export interface RegisteredService {
    name: string;
    version: string;
    state: ServiceState;
    dependencies: string[];
    priority: number; // Low value is higher priority
    type: "core" | "engine" | "service" | "interface";
    healthStatus: "healthy" | "degraded" | "unhealthy";
    config: any;
    supportedEvents: string[];
    initializationTimeMs: number;
    memoryUsageMb: number;
    cpuUsagePercent: number;
}

export class ServiceRegistry {
    private static instance: ServiceRegistry;
    private logger: Logger;
    private services: Map<string, RegisteredService> = new Map();

    private constructor() {
        this.logger = Logger.getInstance();
    }

    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    public register(service: RegisteredService): void {
        this.services.set(service.name.toLowerCase(), service);
        this.logger.info(`[Service Registry] Registered system module: ${service.name} (v${service.version}) [Priority: ${service.priority}]`);
    }

    public getService(name: string): RegisteredService | undefined {
        return this.services.get(name.toLowerCase());
    }

    public updateService(name: string, updates: Partial<RegisteredService>): void {
        const key = name.toLowerCase();
        const existing = this.services.get(key);
        if (existing) {
            this.services.set(key, { ...existing, ...updates });
            this.logger.debug(`[Service Registry] Service ${existing.name} updated: state=${updates.state || existing.state}, health=${updates.healthStatus || existing.healthStatus}`);
        }
    }

    public getServices(): RegisteredService[] {
        return Array.from(this.services.values()).sort((a, b) => a.priority - b.priority);
    }

    public getStatusReport(): object {
        const report: any = {};
        for (const [key, svc] of this.services.entries()) {
            report[svc.name] = {
                state: svc.state,
                health: svc.healthStatus,
                memory: `${svc.memoryUsageMb.toFixed(1)} MB`,
                cpu: `${svc.cpuUsagePercent.toFixed(1)}%`
            };
        }
        return report;
    }
}
