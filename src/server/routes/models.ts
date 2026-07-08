import { Router } from "express";
import { ModelEngine } from "../models/ModelEngine";
import { SmartInstallationEngine } from "../../core/models/SmartInstallationEngine";
import { DownloadUpdateManager } from "../../core/models/DownloadUpdateManager";
import { EnterpriseModelManager } from "../../core/models/EnterpriseModelManager";

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
    res.json({
      bestCoding: "llama-3-8b",
      bestReasoning: "llama-3-8b",
      bestChat: "llama-3-8b",
      bestRag: "llama-3-8b",
      bestAgent: "llama-3-8b",
      bestMultimodal: "llava-1.5",
      bestForHardware: "llama-3-8b",
      bestEfficiency: "llama-3-8b"
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
