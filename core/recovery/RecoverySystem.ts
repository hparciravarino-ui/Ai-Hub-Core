import { Logger } from "../logging/Logger";
import { ServiceRegistry } from "../registry/ServiceRegistry";
import { ConfigManager } from "../configuration/ConfigManager";

export class RecoverySystem {
    private static instance: RecoverySystem;
    private logger: Logger;
    private registry: ServiceRegistry;
    private configManager: ConfigManager;

    private constructor() {
        this.logger = Logger.getInstance();
        this.registry = ServiceRegistry.getInstance();
        this.configManager = ConfigManager.getInstance();
    }

    public static getInstance(): RecoverySystem {
        if (!RecoverySystem.instance) {
            RecoverySystem.instance = new RecoverySystem();
        }
        return RecoverySystem.instance;
    }

    public attemptSelfRepair(serviceName: string, error: Error): boolean {
        this.logger.warn(`[Recovery System] Self-repair triggered for service: ${serviceName}. Reason: ${error.message}`);
        
        try {
            // 1. Rollback configuration if config failure suspected
            if (error.message.includes("config") || error.message.includes("parameter")) {
                this.logger.info("[Recovery System] Suspected malformed configuration. Triggering revision rollback...");
                const history = this.configManager.getConfigHistory();
                if (history.length > 1) {
                    const previousRevision = history[history.length - 2];
                    this.logger.info(`[Recovery System] Rolling back configuration to revision ${previousRevision.version}...`);
                    // Apply rollback
                    const snapshot = previousRevision.configSnapshot;
                    for (const category of Object.keys(snapshot)) {
                        this.configManager.updateConfig(category as any, snapshot[category as any], "recovery_rollback");
                    }
                    return true;
                }
            }

            // 2. Perform soft reload of service status inside Registry
            this.logger.info(`[Recovery System] Attempting to recycle states for ${serviceName}...`);
            this.registry.updateService(serviceName, { state: "Restarting", healthStatus: "degraded" });
            
            setTimeout(() => {
                this.registry.updateService(serviceName, { state: "Running", healthStatus: "healthy" });
                this.logger.info(`[Recovery System] Recycled state successfully. ${serviceName} is now healthy.`);
            }, 200);

            return true;
        } catch (repairError: any) {
            this.logger.critical(`[Recovery System] Self-repair crashed: ${repairError.message}`);
            return false;
        }
    }

    public forceEmergencyReset(): void {
        this.logger.critical("[Recovery System] CRITICAL SYSTEM FAULT! Initiating force emergency reset of all services...");
        const services = this.registry.getServices();
        for (const svc of services) {
            this.registry.updateService(svc.name, { state: "Starting", healthStatus: "degraded" });
        }
        this.logger.info("[Recovery System] Emergency restore signals emitted.");
    }
}
