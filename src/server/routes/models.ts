import { Router } from "express";
import { ModelEngine } from "../models/ModelEngine";
import { SmartInstallationEngine } from "../../core/models/SmartInstallationEngine";
import { DownloadUpdateManager } from "../../core/models/DownloadUpdateManager";
import { EnterpriseModelManager } from "../../core/models/EnterpriseModelManager";
import { ModelSelectionEngine } from "../models/ModelSelectionEngine";

export const modelsRouter = Router();

modelsRouter.get("/evaluate", async (req, res) => {
  try {
    const data = await ModelEngine.evaluateModels();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

modelsRouter.post("/install", async (req, res) => {
  try {
    const modelData = req.body;
    const result = await SmartInstallationEngine.installModel(modelData);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

modelsRouter.get("/updates", async (req, res) => {
  try {
    const catalog = EnterpriseModelManager.getModels();
    const updates = await DownloadUpdateManager.checkUpdates(catalog);
    res.json(updates);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

modelsRouter.get("/rankings", async (req, res) => {
  try {
    const [coding, reasoning, chat, rag, multimodal] = await Promise.all([
      ModelSelectionEngine.selectBestModel({ taskType: "coding" }),
      ModelSelectionEngine.selectBestModel({ taskType: "reasoning" }),
      ModelSelectionEngine.selectBestModel({ taskType: "chat" }),
      ModelSelectionEngine.selectBestModel({ taskType: "rag" }),
      ModelSelectionEngine.selectBestModel({ taskType: "multimodal" })
    ]);

    res.json({
      bestCoding: coding[0]?.modelId || "deepseek-coder-7b",
      bestReasoning: reasoning[0]?.modelId || "gemini-2.5-pro",
      bestChat: chat[0]?.modelId || "llama-3-8b",
      bestRag: rag[0]?.modelId || "gemini-2.5-flash",
      bestAgent: reasoning[0]?.modelId || "gemini-2.5-pro",
      bestMultimodal: multimodal[0]?.modelId || "llava-1.5",
      bestForHardware: chat[0]?.modelId || "llama-3-8b",
      bestEfficiency: "llama-3-8b",
      scores: {
        coding: coding.map(m => ({ id: m.modelId, name: m.name, score: m.score, reasons: m.reasons, metrics: m.metrics })),
        reasoning: reasoning.map(m => ({ id: m.modelId, name: m.name, score: m.score, reasons: m.reasons, metrics: m.metrics })),
        chat: chat.map(m => ({ id: m.modelId, name: m.name, score: m.score, reasons: m.reasons, metrics: m.metrics })),
        rag: rag.map(m => ({ id: m.modelId, name: m.name, score: m.score, reasons: m.reasons, metrics: m.metrics })),
        multimodal: multimodal.map(m => ({ id: m.modelId, name: m.name, score: m.score, reasons: m.reasons, metrics: m.metrics }))
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
