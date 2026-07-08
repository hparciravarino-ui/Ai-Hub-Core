import { Router } from "express";
import { VectorManager } from "../../core/vector/VectorManager";

export const vectorRouter = Router();

vectorRouter.get("/stats", async (req, res) => {
  try {
    const db = VectorManager.getInstance();
    const stats = await db.getStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

vectorRouter.post("/compress", async (req, res) => {
  try {
    const { collection } = req.body;
    const db = VectorManager.getInstance();
    const result = await db.compressCollection(collection || 'enterprise_knowledge');
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

vectorRouter.post("/snapshot/create", async (req, res) => {
  try {
    const { collection } = req.body;
    const db = VectorManager.getInstance();
    const snapshotId = await db.createSnapshot(collection || 'enterprise_knowledge');
    res.json({ success: true, snapshotId, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

vectorRouter.post("/snapshot/restore", async (req, res) => {
  try {
    const { collection, snapshotId } = req.body;
    if (!snapshotId) return res.status(400).json({ error: "Missing snapshotId" });
    const db = VectorManager.getInstance();
    await db.restoreSnapshot(collection || 'enterprise_knowledge', snapshotId);
    res.json({ success: true, message: `Restored successfully from snapshot "${snapshotId}"` });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
