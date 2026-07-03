import { Router } from "express";
import { Kernel } from "../../core/kernel/Kernel";
import { DIContainer } from "../../core/dependency-injection/Container";
import { ChatService } from "../../services/chat/ChatService";
import { ModelManager } from "../../services/models/ModelManager";
import { PluginEngine } from "../../services/plugins/PluginEngine";
import { DashboardService } from "../../services/automation/DashboardService";
import { InferenceEngine } from "../../engines/inference/InferenceEngine";
import { KnowledgeEngine } from "../../engines/knowledge/KnowledgeEngine";
import { LearningEngine } from "../../engines/learning/LearningEngine";
import { HardwareEngine } from "../../engines/hardware/HardwareEngine";

// Core Engine Subsystem Imports
import { DiagnosticSystem } from "../../core/diagnostics/DiagnosticSystem";
import { ConfigManager } from "../../core/configuration/ConfigManager";
import { ServiceRegistry } from "../../core/registry/ServiceRegistry";
import { FeatureFlags } from "../../core/feature-flags/FeatureFlags";
import { VersionManager } from "../../core/version/VersionManager";
import { Logger } from "../../core/logging/Logger";
import { GovernanceSystem } from "../../core/governance/GovernanceSystem";
import { AIOrchestrator } from "../../engines/ai-orchestrator/AIOrchestrator";

export const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
    const kernel = Kernel.getInstance();
    res.json(kernel.getStatus());
});

apiRouter.post("/inference", async (req, res, next) => {
    const { message, history, systemInstruction, modelId } = req.body;
    try {
        const di = DIContainer.getInstance();
        const inferenceEngine = di.resolve<InferenceEngine>("InferenceEngine");
        const response = await inferenceEngine.executeInference(message, modelId || "core_engine_default", history, systemInstruction);
        res.json({ reply: response });
    } catch (e) {
        next(e);
    }
});

apiRouter.get("/models", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const mm = di.resolve<ModelManager>("ModelManager");
        res.json(mm.getStatus());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/hardware", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const hw = di.resolve<HardwareEngine>("HardwareEngine");
        res.json(hw.getStatus());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/plugins", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const plugins = di.resolve<PluginEngine>("PluginEngine");
        res.json(plugins.getStatus());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Chat Service REST APIs
apiRouter.get("/chat", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const cs = di.resolve<ChatService>("ChatService");
        res.json(cs.getAllChats());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.post("/chat", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const cs = di.resolve<ChatService>("ChatService");
        const chat = cs.createChat(req.body);
        res.status(201).json(chat);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.put("/chat/:id", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const cs = di.resolve<ChatService>("ChatService");
        const updated = cs.updateChat(req.params.id, req.body);
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.delete("/chat/:id", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const cs = di.resolve<ChatService>("ChatService");
        cs.deleteChat(req.params.id);
        res.status(204).send();
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.post("/chat/sync", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const cs = di.resolve<ChatService>("ChatService");
        cs.syncAllChats(req.body);
        res.status(200).send({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Dashboard metrics API
apiRouter.get("/dashboard", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const ds = di.resolve<DashboardService>("DashboardService");
        res.json(ds.getDashboardMetrics());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Knowledge API routes
apiRouter.post("/v1/knowledge/query", async (req, res) => {
    const { query } = req.body;
    try {
        const di = DIContainer.getInstance();
        const ke = di.resolve<KnowledgeEngine>("KnowledgeEngine");
        const response = await ke.query(query);
        res.json({ results: response });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post("/v1/knowledge/upload", async (req, res) => {
    const { name, content } = req.body;
    try {
        const di = DIContainer.getInstance();
        const le = di.resolve<LearningEngine>("LearningEngine");
        await le.ingestKnowledge(name, content);
        res.json({ success: true, message: `Document ${name} ingested and indexed.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Legacy and Diagnostic compatibility routes
apiRouter.post("/diagnose", (req, res) => {
    try {
        const di = DIContainer.getInstance();
        const ds = di.resolve<DiagnosticSystem>("DiagnosticSystem");
        res.json(ds.generateSystemReport());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Advanced Core Subsystem Endpoints
apiRouter.get("/core/config", (req, res) => {
    try {
        const cm = ConfigManager.getInstance();
        res.json(cm.getConfig());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/config/export", (req, res) => {
    try {
        const cm = ConfigManager.getInstance();
        res.header("Content-Type", "application/json");
        res.send(cm.exportConfig());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.post("/core/config", (req, res) => {
    try {
        const { category, updates, operator } = req.body;
        const cm = ConfigManager.getInstance();
        cm.updateConfig(category, updates, operator || "api_user");
        res.json({ success: true, config: cm.getConfig() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/services", (req, res) => {
    try {
        const sr = ServiceRegistry.getInstance();
        res.json(sr.getServices());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/feature-flags", (req, res) => {
    try {
        const ff = FeatureFlags.getInstance();
        res.json(ff.getFlags());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.post("/core/feature-flags", (req, res) => {
    try {
        const { key, enabled } = req.body;
        const ff = FeatureFlags.getInstance();
        ff.updateFlagState(key, enabled);
        res.json({ success: true, flags: ff.getFlags() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/versions", (req, res) => {
    try {
        const vm = VersionManager.getInstance();
        res.json(vm.getRegisteredComponents());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/diagnostics", (req, res) => {
    try {
        const ds = DiagnosticSystem.getInstance();
        res.json(ds.generateSystemReport());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/logs", (req, res) => {
    try {
        const { level, module: mod, service: svc, text, correlationId } = req.query;
        const logger = Logger.getInstance();
        const results = logger.searchLogs({
            level: level !== undefined ? parseInt(level as string, 10) : undefined,
            module: mod as string,
            service: svc as string,
            text: text as string,
            correlationId: correlationId as string
        });
        res.json(results);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/governance", (req, res) => {
    try {
        const gov = GovernanceSystem.getInstance();
        res.json(gov.runQualityAudit());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/orchestrator/models", (req, res) => {
    try {
        const orchestrator = AIOrchestrator.getInstance();
        res.json(orchestrator.getAvailableModels());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/orchestrator/kpis", (req, res) => {
    try {
        const orchestrator = AIOrchestrator.getInstance();
        res.json(orchestrator.getRealtimeKPIs());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/core/orchestrator/traceability", (req, res) => {
    try {
        const orchestrator = AIOrchestrator.getInstance();
        res.json(orchestrator.getChapter6TraceabilityMatrix());
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.post("/core/orchestrator/task", async (req, res) => {
    try {
        const { description, category, priority, contextLevel, payload, timeoutMs } = req.body;
        const orchestrator = AIOrchestrator.getInstance();
        const result = await orchestrator.orchestrateTask({
            id: `task-${Date.now()}`,
            description: description || "Richiesta utente generica",
            category: category || orchestrator.autoClassifyRequest(payload?.prompt || ""),
            priority: priority || "Media",
            timeoutMs: timeoutMs || 15000,
            contextLevel: contextLevel || "Chat",
            payload: payload || { prompt: "Hello" }
        });
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apiRouter.get("/models/search", (req, res) => {
    res.json({ models: [], citations: [] });
});

apiRouter.post("/models/download", (req, res) => {
    res.status(501).json({ error: "Download engine non ancora implementato (Fase 9)" });
});

