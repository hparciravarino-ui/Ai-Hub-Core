import { Router } from "express";
import { HardwareEngine } from "../../shared/hardware/HardwareEngine";
import { MetricsEngine } from "../../shared/hardware/MetricsEngine";

export const hardwareRouter = Router();

hardwareRouter.get("/", async (req, res) => {
  try {
    const data = await HardwareEngine.scan();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

hardwareRouter.post("/client-telemetry", async (req, res) => {
  try {
    HardwareEngine.registerClientTelemetry(req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

hardwareRouter.get("/metrics", async (req, res) => {
  try {
    const data = await MetricsEngine.getLiveMetrics();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
