import { Router } from "express";
import { BenchmarkRunner } from "../benchmark/BenchmarkRunner";
import { BenchmarkDatabase } from "../benchmark/BenchmarkDatabase";

export const benchmarkRouter = Router();

benchmarkRouter.post("/run", async (req, res) => {
  try {
    const { modelId, modelName, provider } = req.body || {};
    if (!modelId || !provider) {
      return res.status(400).json({ error: "Missing modelId or provider" });
    }
    const result = await BenchmarkRunner.runBenchmark(modelId, modelName, provider);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

benchmarkRouter.get("/results", async (req, res) => {
  try {
    const results = await BenchmarkDatabase.getAllResults();
    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
