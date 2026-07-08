import { Router } from "express";
import { QualityAssuranceEngine } from "../../core/qa/QualityAssuranceEngine";

export const qaRouter = Router();

qaRouter.get("/stats", (req, res) => {
  try {
    res.json({
      report: QualityAssuranceEngine.getLatestReport(),
      testCases: QualityAssuranceEngine.getTestCases(),
      vulnerabilities: QualityAssuranceEngine.getVulnerabilities()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

qaRouter.post("/run", async (req, res) => {
  try {
    const { suite } = req.body || {};
    const report = await QualityAssuranceEngine.runQAExecution(suite);
    res.json({ success: true, report, testCases: QualityAssuranceEngine.getTestCases() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
