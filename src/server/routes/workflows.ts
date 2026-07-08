import { Router } from "express";
import { WorkflowEngine } from "../../core/workflows/WorkflowEngine";

export const workflowsRouter = Router();

workflowsRouter.post("/execute", async (req, res) => {
  try {
    const { workflow, input } = req.body;
    if (!workflow || !workflow.id || !workflow.nodes) {
      return res.status(400).json({ error: "Invalid workflow payload." });
    }
    const result = await WorkflowEngine.executeWorkflow(workflow, input || {});
    res.json({ success: true, result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

workflowsRouter.get("/stats", async (req, res) => {
  try {
    const stats = WorkflowEngine.getExecutionStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
