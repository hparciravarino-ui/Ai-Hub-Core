import { Router } from "express";
import { RAGService } from "../../core/knowledge/RAGService";

export const knowledgeRouter = Router();

knowledgeRouter.post("/ingest", async (req, res) => {
  try {
    const { text, filename, mimeType, author } = req.body;
    if (!text || !filename) {
      return res.status(400).json({ error: "Missing 'text' or 'filename' fields inside payload." });
    }
    const buffer = new TextEncoder().encode(text).buffer;
    const result = await RAGService.ingestDocument(buffer, mimeType || 'text/plain', filename, author || 'api_user');
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

knowledgeRouter.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const topK = parseInt(req.query.topK as string) || 5;
    const filtersStr = req.query.filters as string;
    
    let filters: any = undefined;
    if (filtersStr) {
      try {
        filters = JSON.parse(filtersStr);
      } catch {
        // ignore invalid json filters
      }
    }

    const results = await RAGService.search(query, topK, filters);
    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

knowledgeRouter.get("/stats", async (req, res) => {
  try {
    const stats = await RAGService.getStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
