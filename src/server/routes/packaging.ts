import { Router } from "express";
import { PackagingEngine } from "../../core/packaging/PackagingEngine";

export const packagingRouter = Router();

packagingRouter.get("/status", (req, res) => {
  try {
    res.json({
      targets: PackagingEngine.getTargets(),
      releases: PackagingEngine.getReleases(),
      backups: PackagingEngine.getBackups()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

packagingRouter.post("/compile", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Missing target ID" });
    const success = await PackagingEngine.compileTarget(id);
    res.json({ success, targets: PackagingEngine.getTargets() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

packagingRouter.post("/backup", (req, res) => {
  try {
    const backup = PackagingEngine.triggerBackup('manual');
    res.json({ success: true, backup, backups: PackagingEngine.getBackups() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

packagingRouter.post("/restore", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Missing backup ID" });
    const success = await PackagingEngine.restoreBackup(id);
    res.json({ success });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
