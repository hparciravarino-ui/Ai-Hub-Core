import { Router } from "express";
import { TelemetryManager } from "../../core/monitoring/TelemetryManager";

export const telemetryRouter = Router();

telemetryRouter.get("/stats", (req, res) => {
  try {
    res.json({
      metrics: TelemetryManager.getMetrics(),
      alerts: TelemetryManager.getAlerts()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

telemetryRouter.get("/diagnostics", (req, res) => {
  try {
    const diagnostics = TelemetryManager.runFullDiagnostics();
    res.json(diagnostics);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
