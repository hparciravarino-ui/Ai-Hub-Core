import { Router } from "express";
import { CoreEngine } from "../../core/CoreEngine";

export const knowledgeEngineRouter = Router();

knowledgeEngineRouter.post("/query", async (req, res) => {
  const { query, documentId } = req.body;
  const coreEngine = CoreEngine.getInstance();
  
  try {
    const response = await coreEngine.knowledgeEngine.query(query);
    res.json({ results: response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

knowledgeEngineRouter.post("/upload", async (req, res) => {
  // Normally would parse multipart form data, but for this step we will just accept content
  const { name, content } = req.body;
  const coreEngine = CoreEngine.getInstance();
  
  try {
    await coreEngine.knowledgeEngine.vault.storeDocument(name, content);
    res.json({ success: true, message: `Document ${name} indexed in vault.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
