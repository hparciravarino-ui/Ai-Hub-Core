import { ModelCapabilityProfile, CapabilityRequest, AICapability } from "./types";
import { Logger } from "../../core/logging/Logger";
import { EventManager } from "../../core/events/EventManager";

export class ModelCapabilityRegistry {
    private models: Map<string, ModelCapabilityProfile> = new Map();
    private logger = Logger.getInstance();
    private eventBus = EventManager.getInstance();

    public registerModel(profile: ModelCapabilityProfile): void {
        this.models.set(profile.id, profile);
        this.logger.info(`[ModelCapabilityRegistry] Registered model: ${profile.name} [Capabilities: ${profile.capabilities.join(", ")}]`);
        this.eventBus.publish("ModelRegistered", { modelId: profile.id });
    }

    public getModel(id: string): ModelCapabilityProfile | undefined {
        return this.models.get(id);
    }

    public getAllModels(): ModelCapabilityProfile[] {
        return Array.from(this.models.values());
    }

    /**
     * Finds the best model matching the requested capabilities.
     * 8.6 Capability Based Routing
     */
    public findBestModel(request: CapabilityRequest): ModelCapabilityProfile | null {
        let bestMatch: ModelCapabilityProfile | null = null;
        let highestScore = -1;

        for (const model of this.models.values()) {
            if (model.status !== "Ready" && model.status !== "Loaded" && model.status !== "Running") continue;

            // Check strict requirements
            const hasAllRequired = request.requiredCapabilities.every(cap => model.capabilities.includes(cap));
            if (!hasAllRequired) continue;

            if (request.maxVramMb && model.hardwareRequirements.vramMb > request.maxVramMb) continue;
            if (request.minSpeedTokensPerSec && model.performance.speedTokensPerSec < request.minSpeedTokensPerSec) continue;

            // Calculate fit score based on preferred capabilities and performance metrics
            let score = 0;
            if (request.preferredCapabilities) {
                for (const pref of request.preferredCapabilities) {
                    if (model.capabilities.includes(pref)) score += 10;
                }
            }

            // Factor in accuracy and speed for breaking ties
            score += (model.performance.accuracyScore / 10);
            score += (model.performance.speedTokensPerSec / 10);

            if (score > highestScore) {
                highestScore = score;
                bestMatch = model;
            }
        }

        if (bestMatch) {
            this.logger.debug(`[CapabilityBasedRouting] Routed to model ${bestMatch.name} for capabilities: [${request.requiredCapabilities.join(", ")}]`);
        } else {
            this.logger.warn(`[CapabilityBasedRouting] No model found matching capabilities: [${request.requiredCapabilities.join(", ")}]`);
        }

        return bestMatch;
    }

    /**
     * 8.16 Model Lifecycle transitions
     */
    public updateModelState(id: string, state: ModelCapabilityProfile["status"]): void {
        const model = this.models.get(id);
        if (model) {
            const oldState = model.status;
            model.status = state;
            this.logger.info(`[ModelLifecycle] Model ${model.name} transitioned: ${oldState} -> ${state}`);
            this.eventBus.publish("ModelStateChanged", { modelId: id, oldState, newState: state });
        }
    }
}
