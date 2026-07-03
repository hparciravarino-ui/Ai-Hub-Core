import { Logger } from "../../core/logging/Logger";

export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    permissionScopes: string[];
    status: "active" | "disabled";
}

export class PluginEngine {
    private logger: Logger;
    private plugins: Map<string, PluginManifest> = new Map();

    constructor() {
        this.logger = Logger.getInstance();
        this.loadCorePlugins();
    }

    private loadCorePlugins(): void {
        const cores: PluginManifest[] = [
            { id: "copilot-assistant", name: "Copilot Coding Assistant", version: "1.0.0", permissionScopes: ["chat", "files"], status: "active" },
            { id: "git-visualizer", name: "Git Repo Map Visualizer", version: "1.0.2", permissionScopes: ["files"], status: "active" }
        ];
        for (const p of cores) {
            this.plugins.set(p.id, p);
        }
    }

    public registerPlugin(plugin: PluginManifest): void {
        this.plugins.set(plugin.id, plugin);
        this.logger.info(`[Plugin Engine] Dynamically loaded extension: ${plugin.name} v${plugin.version}`);
    }

    public getActivePlugins(): PluginManifest[] {
        return Array.from(this.plugins.values()).filter(p => p.status === "active");
    }

    public getStatus(): object {
        return {
            status: "active",
            loadedPluginsCount: this.plugins.size
        };
    }
}
