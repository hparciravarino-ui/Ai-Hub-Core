export interface SystemConfig {
    env: string;
    port: number;
    logLevel: string;
    geminiApiKey?: string;
}

export interface AIConfig {
    defaultModel: string;
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
}

export interface RuntimeConfig {
    enabledRuntimes: string[];
    concurrencyLimit: number;
    timeoutMs: number;
}

export interface HardwareConfig {
    enableGpu: boolean;
    threadCount: number;
    memoryLimitGb: number;
}

export interface DatabaseConfig {
    sqlitePath: string;
    enableWalMode: boolean;
    maxConnections: number;
}

export interface ChatConfig {
    maxHistoryMessages: number;
    autoSummaryOnMessageCount: number;
}

export interface PluginConfig {
    allowedPlugins: string[];
    sandboxLevel: "isolated" | "permissive";
}

export interface BackupConfig {
    autoBackupEnabled: boolean;
    backupIntervalMs: number;
    destinationPath: string;
}

export interface CloudConfig {
    enableCloudSync: boolean;
    endpoint: string;
}

export interface PerformanceConfig {
    lowMemoryMode: boolean;
    cacheTimeoutMs: number;
}

export interface LearningConfig {
    vectorDimension: number;
    similarityThreshold: number;
}

export interface KnowledgeConfig {
    indexingDepth: number;
    chunkSize: number;
}

export interface WorkspaceConfig {
    rootPath: string;
    allowedExtensions: string[];
}

export interface SecurityConfig {
    enableFileHashAudits: boolean;
    restrictedDirectories: string[];
}

export interface LoggingConfig {
    maxBufferEntries: number;
    consoleReportingLevel: string;
}

export interface UIConfig {
    theme: "light" | "dark" | "system";
    showTelemetry: boolean;
}

export interface AppConfig {
    sistema: SystemConfig;
    ai: AIConfig;
    runtime: RuntimeConfig;
    hardware: HardwareConfig;
    database: DatabaseConfig;
    chat: ChatConfig;
    plugin: PluginConfig;
    backup: BackupConfig;
    cloud: CloudConfig;
    performance: PerformanceConfig;
    learning: LearningConfig;
    knowledge: KnowledgeConfig;
    workspace: WorkspaceConfig;
    security: SecurityConfig;
    logging: LoggingConfig;
    ui: UIConfig;
}

export interface ConfigRevision {
    version: number;
    timestamp: string;
    operator: string;
    configSnapshot: AppConfig;
}

export interface IConfigManager {
    getConfig(): AppConfig;
    get<C extends keyof AppConfig>(category: C): AppConfig[C];
    updateConfig<C extends keyof AppConfig>(category: C, updates: Partial<AppConfig[C]>, operator: string): void;
    getConfigHistory(): ConfigRevision[];
    exportConfig(): string;
}

export class ConfigManager implements IConfigManager {
    private static instance: ConfigManager;
    private config: AppConfig;
    private history: ConfigRevision[] = [];
    private currentVersion: number = 1;

    private constructor() {
        this.config = {
            sistema: {
                env: process.env.NODE_ENV || "development",
                port: parseInt(process.env.PORT || "3000", 10),
                logLevel: process.env.LOG_LEVEL || "INFO",
                geminiApiKey: process.env.GEMINI_API_KEY
            },
            ai: {
                defaultModel: "core_engine_default",
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            },
            runtime: {
                enabledRuntimes: ["gemini-runtime"],
                concurrencyLimit: 4,
                timeoutMs: 30000
            },
            hardware: {
                enableGpu: false,
                threadCount: 4,
                memoryLimitGb: 4.0
            },
            database: {
                sqlitePath: "./data/aihub.db",
                enableWalMode: true,
                maxConnections: 10
            },
            chat: {
                maxHistoryMessages: 100,
                autoSummaryOnMessageCount: 10
            },
            plugin: {
                allowedPlugins: ["copilot-assistant", "git-visualizer"],
                sandboxLevel: "isolated"
            },
            backup: {
                autoBackupEnabled: false,
                backupIntervalMs: 86400000,
                destinationPath: "./backups"
            },
            cloud: {
                enableCloudSync: false,
                endpoint: "https://api.aihub-enterprise.io"
            },
            performance: {
                lowMemoryMode: true,
                cacheTimeoutMs: 600000
            },
            learning: {
                vectorDimension: 768,
                similarityThreshold: 0.8
            },
            knowledge: {
                indexingDepth: 5,
                chunkSize: 1000
            },
            workspace: {
                rootPath: ".",
                allowedExtensions: [".ts", ".tsx", ".js", ".jsx", ".md", ".json"]
            },
            security: {
                enableFileHashAudits: true,
                restrictedDirectories: ["/etc", "/sys", "/proc", "/usr"]
            },
            logging: {
                maxBufferEntries: 2000,
                consoleReportingLevel: "INFO"
            },
            ui: {
                theme: "light",
                showTelemetry: false
            }
        };

        // Record first version snapshot
        this.recordHistory("system_init");
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public getConfig(): AppConfig {
        return this.config;
    }

    public get<C extends keyof AppConfig>(category: C): AppConfig[C] {
        return this.config[category];
    }

    public updateConfig<C extends keyof AppConfig>(category: C, updates: Partial<AppConfig[C]>, operator: string = "operator"): void {
        this.config[category] = {
            ...this.config[category],
            ...updates
        };
        this.currentVersion++;
        this.recordHistory(operator);
    }

    private recordHistory(operator: string): void {
        this.history.push({
            version: this.currentVersion,
            timestamp: new Date().toISOString(),
            operator,
            configSnapshot: JSON.parse(JSON.stringify(this.config))
        });
    }

    public getConfigHistory(): ConfigRevision[] {
        return this.history;
    }

    public exportConfig(): string {
        return JSON.stringify({
            application: "AIHub Enterprise",
            exportedAt: new Date().toISOString(),
            schemaVersion: this.currentVersion,
            config: this.config
        }, null, 4);
    }
}
