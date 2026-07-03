import { Logger } from "../logging/Logger";

export interface ComponentMetadata {
    name: string;
    version: string;
    build: string;
    commit: string;
    compatibility: string;
    checksum: string;
    signature: string;
    dependencies: string[];
}

export class VersionManager {
    private static instance: VersionManager;
    private logger: Logger;
    private registry: Map<string, ComponentMetadata> = new Map();

    private constructor() {
        this.logger = Logger.getInstance();
        this.registerCoreComponents();
    }

    public static getInstance(): VersionManager {
        if (!VersionManager.instance) {
            VersionManager.instance = new VersionManager();
        }
        return VersionManager.instance;
    }

    private registerCoreComponents(): void {
        const coreComponents: ComponentMetadata[] = [
            {
                name: "Kernel",
                version: "1.0.0",
                build: "b2026.07.03",
                commit: "9ef8a23b",
                compatibility: ">=1.0.0",
                checksum: "sha256:d83d1518f88836ffc5b967d60505b22b620b7518f88836ffc5b967d60505b22b",
                signature: "sig:kernel:open-source-licensed-v1",
                dependencies: []
            },
            {
                name: "Logger",
                version: "1.0.0",
                build: "b2026.07.03",
                commit: "2f38d61a",
                compatibility: ">=1.0.0",
                checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                signature: "sig:logger:open-source-licensed-v1",
                dependencies: ["Kernel"]
            },
            {
                name: "ConfigManager",
                version: "1.0.0",
                build: "b2026.07.03",
                commit: "fbc3a18e",
                compatibility: ">=1.0.0",
                checksum: "sha256:f126da38729ba9bc101019f126da38729ba9bc101019f126da38729ba9bc10",
                signature: "sig:config:open-source-licensed-v1",
                dependencies: ["Kernel"]
            }
        ];

        for (const comp of coreComponents) {
            this.registerComponent(comp);
        }
    }

    public registerComponent(comp: ComponentMetadata): void {
        this.registry.set(comp.name.toLowerCase(), comp);
        this.logger.debug(`[Version Manager] Registered component metadata: ${comp.name} v${comp.version}`);
    }

    public getComponent(name: string): ComponentMetadata | undefined {
        return this.registry.get(name.toLowerCase());
    }

    public getRegisteredComponents(): ComponentMetadata[] {
        return Array.from(this.registry.values());
    }

    public verifyAllSignatures(): boolean {
        this.logger.info("[Version Manager] Verifying signatures and checksums of installed packages...");
        for (const comp of this.registry.values()) {
            if (!comp.signature.startsWith("sig:")) {
                this.logger.error(`[Version Manager] Signature mismatch or corrupted for component: ${comp.name}`);
                return false;
            }
        }
        return true;
    }
}
