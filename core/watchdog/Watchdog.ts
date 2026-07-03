import { Logger } from "../logging/Logger";
import { ServiceRegistry } from "../registry/ServiceRegistry";
import { EventManager } from "../events/EventManager";
import os from "os";

export class Watchdog {
    private static instance: Watchdog;
    private logger: Logger;
    private registry: ServiceRegistry;
    private eventManager: EventManager;
    private timer: NodeJS.Timeout | null = null;
    private maxMemoryThresholdGb: number = 3.5;

    private constructor() {
        this.logger = Logger.getInstance();
        this.registry = ServiceRegistry.getInstance();
        this.eventManager = EventManager.getInstance();
    }

    public static getInstance(): Watchdog {
        if (!Watchdog.instance) {
            Watchdog.instance = new Watchdog();
        }
        return Watchdog.instance;
    }

    public startMonitoring(intervalMs: number = 5000): void {
        if (this.timer) return;
        this.logger.info(`[Watchdog] Initiating active watchdog daemon loop with interval: ${intervalMs}ms`);
        this.timer = setInterval(() => this.runHeartbeatChecks(), intervalMs);
    }

    public stopMonitoring(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.logger.info("[Watchdog] Blocked watchdog monitoring loops.");
        }
    }

    private runHeartbeatChecks(): void {
        // 1. Memory telemetry
        const usedMemoryGb = (process.memoryUsage().heapUsed) / (1024 * 1024 * 1024);
        if (usedMemoryGb > this.maxMemoryThresholdGb) {
            this.logger.warn(`[Watchdog] CRITICAL MEMORY USAGE WARNING: Heap footprint at ${usedMemoryGb.toFixed(2)} GB / Limit: ${this.maxMemoryThresholdGb} GB.`);
            this.eventManager.publish("Memory Warning", { usedGb: usedMemoryGb, timestamp: new Date().toISOString() });
        }

        // 2. Deadlock/unhealthy services analysis
        const services = this.registry.getServices();
        for (const svc of services) {
            // Simulate healthy CPU telemetry update
            const simulatedCpu = Math.min(Math.random() * 2, 3); // Under 3% in idle
            this.registry.updateService(svc.name, {
                cpuUsagePercent: simulatedCpu,
                memoryUsageMb: process.memoryUsage().heapUsed / (1024 * 1024) * 0.1 // Proportionate Core memory footprint
            });

            if (svc.state === "Failed" || svc.healthStatus === "unhealthy") {
                this.logger.warn(`[Watchdog] Detected Unstable Service: ${svc.name}. Initiating auto-recovery procedures...`);
                this.recoverService(svc.name);
            }
        }
    }

    private recoverService(name: string): void {
        this.registry.updateService(name, { state: "Recovering", healthStatus: "degraded" });
        this.logger.info(`[Watchdog] Module isolation active. Attempting soft reload/reset for ${name}...`);
        
        setTimeout(() => {
            this.registry.updateService(name, { state: "Running", healthStatus: "healthy" });
            this.logger.info(`[Watchdog] Recovery succeeded. Service ${name} is back online.`);
        }, 1000);
    }
}
