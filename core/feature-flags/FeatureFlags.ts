import { Logger } from "../logging/Logger";

export type FeatureStage = "experimental" | "beta" | "stable" | "deprecated" | "removed";

export interface FeatureFlag {
    key: string;
    description: string;
    stage: FeatureStage;
    enabled: boolean;
}

export class FeatureFlags {
    private static instance: FeatureFlags;
    private logger: Logger;
    private flags: Map<string, FeatureFlag> = new Map();

    private constructor() {
        this.logger = Logger.getInstance();
        this.loadDefaultFlags();
    }

    public static getInstance(): FeatureFlags {
        if (!FeatureFlags.instance) {
            FeatureFlags.instance = new FeatureFlags();
        }
        return FeatureFlags.instance;
    }

    private loadDefaultFlags(): void {
        const defaults: FeatureFlag[] = [
            { key: "enable-fast-inference", description: "Use optimized GPU channels if available", stage: "stable", enabled: true },
            { key: "dynamic-knowledge-graph", description: "Construct visual connections between documents", stage: "experimental", enabled: false },
            { key: "experimental-copilot-runtimes", description: "Allow community-sourced local LLMs", stage: "beta", enabled: true },
            { key: "legacy-sqlite-sync", description: "Sync data using raw manual SQL dumps instead of Drizzle", stage: "deprecated", enabled: false }
        ];

        for (const f of defaults) {
            this.flags.set(f.key, f);
        }
    }

    public isEnabled(key: string): boolean {
        const flag = this.flags.get(key);
        if (!flag) return false;
        if (flag.stage === "removed") return false;
        return flag.enabled;
    }

    public registerFlag(flag: FeatureFlag): void {
        this.flags.set(flag.key, flag);
        this.logger.debug(`[Feature Flags] Registered flag: ${flag.key} [${flag.stage}] = ${flag.enabled}`);
    }

    public updateFlagState(key: string, enabled: boolean): void {
        const flag = this.flags.get(key);
        if (flag) {
            flag.enabled = enabled;
            this.logger.info(`[Feature Flags] Flag ${key} updated to: ${enabled}`);
        } else {
            this.logger.warn(`[Feature Flags] Flag ${key} not found for updates.`);
        }
    }

    public getFlags(): FeatureFlag[] {
        return Array.from(this.flags.values());
    }
}
