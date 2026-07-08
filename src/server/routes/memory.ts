import { Router } from "express";
import { PlatformMemory } from "../../core/memory/PlatformMemory";

export const memoryRouter = Router();

memoryRouter.get("/stats", async (req, res) => {
  try {
    const stats = PlatformMemory.getStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

memoryRouter.post("/gc", async (req, res) => {
  try {
    const stats = PlatformMemory.runGarbageCollection();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

memoryRouter.get("/backup", async (req, res) => {
  try {
    const dump = await PlatformMemory.backupMemoryDump();
    res.setHeader('Content-Type', 'application/json');
    res.send(dump);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

memoryRouter.post("/restore", async (req, res) => {
  try {
    const { dump } = req.body;
    if (!dump) return res.status(400).json({ error: "Missing memory backup dump data." });
    await PlatformMemory.restoreMemoryDump(dump);
    res.json({ success: true, message: "System memory restored successfully." });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
