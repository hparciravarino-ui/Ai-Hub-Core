import { Router } from "express";
import { AgentManager } from "../../core/agents/AgentManager";

export const agentsRouter = Router();

agentsRouter.get("/", async (req, res) => {
  try {
    const agents = AgentManager.getAllAgents().map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      capabilities: a.capabilities,
      config: a.config,
      memoryLength: a.getMemory().length
    }));
    res.json(agents);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

agentsRouter.post("/execute", async (req, res) => {
  try {
    const { agentId, task, context } = req.body;
    if (!agentId || !task) {
      return res.status(400).json({ error: "Missing agentId or task parameters" });
    }
    const result = await AgentManager.orchestrateTask(agentId, task, context);
    res.json({ result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

agentsRouter.post("/delegate", async (req, res) => {
  try {
    const { fromAgentId, toAgentId, subtask, context } = req.body;
    if (!fromAgentId || !toAgentId || !subtask) {
      return res.status(400).json({ error: "Missing fromAgentId, toAgentId, or subtask parameters" });
    }
    const result = await AgentManager.delegateTask(fromAgentId, toAgentId, subtask, context);
    res.json({ result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

agentsRouter.get("/stats", async (req, res) => {
  try {
    const stats = AgentManager.getStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
