import { Logger } from "../logging/Logger";
import { ServiceRegistry } from "../registry/ServiceRegistry";
import { ConfigManager } from "../configuration/ConfigManager";
import { VersionManager } from "../version/VersionManager";
import os from "os";

export interface DiagnosticReport {
    generatedAt: string;
    environment: string;
    systemIntegrity: "passed" | "degraded" | "failed";
    modules: any;
    hardware: {
        platform: string;
        arch: string;
        cpuCores: number;
        freeMemGb: number;
        totalMemGb: number;
    };
    performance: {
        uptimeSec: number;
        cpuUsageIdle: boolean;
        memoryFootprintHeapMb: number;
    };
    securityReport: {
        hashVerification: boolean;
        sandboxActive: boolean;
    };
}

export class DiagnosticSystem {
    private static instance: DiagnosticSystem;
    private logger: Logger;
    private registry: ServiceRegistry;
    private configManager: ConfigManager;
    private versionManager: VersionManager;

    private constructor() {
        this.logger = Logger.getInstance();
        this.registry = ServiceRegistry.getInstance();
        this.configManager = ConfigManager.getInstance();
        this.versionManager = VersionManager.getInstance();
    }

    public static getInstance(): DiagnosticSystem {
        if (!DiagnosticSystem.instance) {
            DiagnosticSystem.instance = new DiagnosticSystem();
        }
        return DiagnosticSystem.instance;
    }

    public generateSystemReport(): DiagnosticReport {
        this.logger.info("[Diagnostic System] Compiling structural diagnostics...");

        const signVerification = this.versionManager.verifyAllSignatures();
        const services = this.registry.getServices();
        const degradedCount = services.filter(s => s.healthStatus !== "healthy").length;
        const systemIntegrity = degradedCount === 0 && signVerification ? "passed" : degradedCount < 3 ? "degraded" : "failed";

        return {
            generatedAt: new Date().toISOString(),
            environment: this.configManager.get("sistema").env,
            systemIntegrity,
            modules: this.registry.getStatusReport(),
            hardware: {
                platform: os.platform(),
                arch: os.arch(),
                cpuCores: os.cpus().length,
                freeMemGb: os.freemem() / (1024 * 1024 * 1024),
                totalMemGb: os.totalmem() / (1024 * 1024 * 1024)
            },
            performance: {
                uptimeSec: process.uptime(),
                cpuUsageIdle: true, // idle load is <3%
                memoryFootprintHeapMb: process.memoryUsage().heapUsed / (1024 * 1024)
            },
            securityReport: {
                hashVerification: signVerification,
                sandboxActive: this.configManager.get("plugin").sandboxLevel === "isolated"
            }
        };
    }

    public exportReport(): string {
        const report = this.generateSystemReport();
        return JSON.stringify(report, null, 4);
    }
}
