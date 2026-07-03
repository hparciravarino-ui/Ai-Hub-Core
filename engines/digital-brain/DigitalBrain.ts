import { Logger } from "../../core/logging/Logger";

export interface SystemPreference {
    theme: string;
    temperature: number;
    maxTokens: number;
    activeAgents: string[];
}

export interface DecisionLog {
    timestamp: string;
    action: string;
    contextReasoning: string;
}

export class DigitalBrain {
    private logger: Logger;
    private preferences: SystemPreference;
    private decisionHistory: DecisionLog[] = [];

    constructor() {
        this.logger = Logger.getInstance();
        this.preferences = {
            theme: "slate-dark",
            temperature: 0.7,
            maxTokens: 2048,
            activeAgents: ["planner", "code-architect"]
        };
    }

    public async initialize(): Promise<void> {
        this.logger.info("[Digital Brain] Connecting context pipelines and recalling experiences...");
    }

    public logDecision(action: string, contextReasoning: string): void {
        const entry: DecisionLog = {
            timestamp: new Date().toISOString(),
            action,
            contextReasoning
        };
        this.decisionHistory.push(entry);
        this.logger.info(`[Digital Brain] Decision registered: ${action}`);
    }

    public updatePreference(prefs: Partial<SystemPreference>): void {
        this.preferences = { ...this.preferences, ...prefs };
        this.logger.info("[Digital Brain] User preferences synchronized.");
    }

    public getPreferences(): SystemPreference {
        return this.preferences;
    }

    public getDecisionHistory(): DecisionLog[] {
        return this.decisionHistory;
    }

    public getStatus(): object {
        return {
            status: "active",
            cognitiveLoad: "idle",
            storedDecisionsCount: this.decisionHistory.length
        };
    }
}
