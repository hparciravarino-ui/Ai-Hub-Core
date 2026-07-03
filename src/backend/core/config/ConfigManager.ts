/**
 * Configuration System
 * Centralized configuration management.
 */

export interface SystemConfig {
    env: string;
    port: number;
    logLevel: string;
}

export class ConfigManager {
    private static instance: ConfigManager;
    private config: SystemConfig;

    private constructor() {
        this.config = {
            env: process.env.NODE_ENV || "development",
            port: parseInt(process.env.PORT || "3000", 10),
            logLevel: process.env.LOG_LEVEL || "INFO"
        };
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public getConfig(): SystemConfig {
        return this.config;
    }

    public get<K extends keyof SystemConfig>(key: K): SystemConfig[K] {
        return this.config[key];
    }
}
