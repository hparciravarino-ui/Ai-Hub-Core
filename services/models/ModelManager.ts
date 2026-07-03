import { Logger } from "../../core/logging/Logger";

export interface ModelProfile {
    id: string;
    name: string;
    type: "local" | "cloud";
    sizeGb?: number;
    quantization?: string;
    status: "downloaded" | "available" | "error";
}

export class ModelManager {
    private logger: Logger;
    private catalog: Map<string, ModelProfile> = new Map();

    constructor() {
        this.logger = Logger.getInstance();
        this.loadDefaultCatalog();
    }

    private loadDefaultCatalog(): void {
        const defaultModels: ModelProfile[] = [
            { id: "core_engine_default", name: "Core Engine Proxy (Online)", type: "cloud", status: "downloaded" },
            { id: "llama-3-8b", name: "LLaMA 3 (8B)", type: "local", sizeGb: 4.8, quantization: "Q4_K_M", status: "available" },
            { id: "phi-3-mini", name: "Phi-3 Mini (3.8B)", type: "local", sizeGb: 2.2, quantization: "Q4_K_M", status: "available" }
        ];
        for (const m of defaultModels) {
            this.catalog.set(m.id, m);
        }
    }

    public getModels(): ModelProfile[] {
        return Array.from(this.catalog.values());
    }

    public getModel(id: string): ModelProfile | undefined {
        return this.catalog.get(id);
    }

    public registerModel(model: ModelProfile): void {
        this.catalog.set(model.id, model);
        this.logger.info(`[Model Manager] Registered new model: ${model.name}`);
    }

    public getStatus(): object {
        return {
            status: "active",
            catalogSize: this.catalog.size
        };
    }
}
