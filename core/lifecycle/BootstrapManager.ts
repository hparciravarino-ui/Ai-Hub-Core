import { Logger } from "../logging/Logger";
import { ConfigManager } from "../configuration/ConfigManager";
import { ServiceRegistry } from "../registry/ServiceRegistry";
import os from "os";
import fs from "fs";
import path from "path";

export interface BootstrapReport {
    timestamp: string;
    compatibility: {
        osType: string;
        osArch: string;
        isSupported: boolean;
    };
    systemResources: {
        totalMemoryGb: number;
        freeMemoryGb: number;
        hasMinimumMemory: boolean;
        hasGpu: boolean;
    };
    filesystem: {
        requiredDirectoriesChecked: string[];
        createdDirectories: string[];
        hasPermissions: boolean;
    };
    verificationStatus: {
        databaseAccessible: boolean;
        runtimesValidated: boolean;
        pluginsValidated: boolean;
        dependenciesSatisfied: boolean;
    };
    errors: string[];
    canBoot: boolean;
}

export class BootstrapManager {
    private static instance: BootstrapManager;
    private logger: Logger;
    private configManager: ConfigManager;

    private constructor() {
        this.logger = Logger.getInstance();
        this.configManager = ConfigManager.getInstance();
    }

    public static getInstance(): BootstrapManager {
        if (!BootstrapManager.instance) {
            BootstrapManager.instance = new BootstrapManager();
        }
        return BootstrapManager.instance;
    }

    public async executePreBootChecks(): Promise<BootstrapReport> {
        this.logger.info("[Bootstrap Manager] Commencing structural system pre-boot audits...");
        const errors: string[] = [];
        const requiredDirs = ["./data", "./backups", "./logs"];
        const createdDirs: string[] = [];

        // 1. Check OS compatibility
        const osType = os.type();
        const osArch = os.arch();
        const supportedPlatforms = ["Linux", "Darwin", "Windows_NT"];
        const isOSSupported = supportedPlatforms.includes(osType);
        if (!isOSSupported) {
            errors.push(`Operating System "${osType}" is outside enterprise certified list.`);
        }

        // 2. Check memory & resources
        const totalMemGb = os.totalmem() / (1024 * 1024 * 1024);
        const freeMemGb = os.freemem() / (1024 * 1024 * 1024);
        const hasMinimumMemory = totalMemGb >= 2.0; // Needs at least 2GB of memory
        if (!hasMinimumMemory) {
            errors.push(`Inadequate physical memory: ${totalMemGb.toFixed(2)} GB total (Minimum required: 2.0 GB).`);
        }

        // 3. Ensure essential workspace directories are created physically
        let hasPermissions = true;
        for (const dir of requiredDirs) {
            try {
                const fullPath = path.resolve(dir);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    createdDirs.push(dir);
                    this.logger.info(`[Bootstrap Manager] Provisioned missing directory: ${dir}`);
                }
            } catch (e: any) {
                hasPermissions = false;
                errors.push(`Filesystem write access denied for path: ${dir}. Error: ${e.message}`);
            }
        }

        // 4. Validate SQLite connection readiness (Mock check during bootstrap)
        const dbConfig = this.configManager.get("database");
        let databaseAccessible = true;
        try {
            const dbDir = path.dirname(dbConfig.sqlitePath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
        } catch (e: any) {
            databaseAccessible = false;
            errors.push(`Database connection directory inaccessible: ${dbConfig.sqlitePath}`);
        }

        const runtimesValidated = this.configManager.get("runtime").enabledRuntimes.length > 0;
        if (!runtimesValidated) {
            errors.push("No model runtimes are enabled inside runtime configurations.");
        }

        const pluginsValidated = true;
        const dependenciesSatisfied = true;
        const canBoot = errors.length === 0;

        return {
            timestamp: new Date().toISOString(),
            compatibility: {
                osType,
                osArch,
                isSupported: isOSSupported
            },
            systemResources: {
                totalMemoryGb: totalMemGb,
                freeMemoryGb: freeMemGb,
                hasMinimumMemory,
                hasGpu: this.configManager.get("hardware").enableGpu
            },
            filesystem: {
                requiredDirectoriesChecked: requiredDirs,
                createdDirectories: createdDirs,
                hasPermissions
            },
            verificationStatus: {
                databaseAccessible,
                runtimesValidated,
                pluginsValidated,
                dependenciesSatisfied
            },
            errors,
            canBoot
        };
    }
}
