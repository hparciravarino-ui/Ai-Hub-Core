export class BenchmarkService {
  public static async runBenchmark(modelId: string, modelName: string, provider: 'native' | 'llamacpp') {
    const res = await fetch("/api/benchmark/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId, modelName, provider })
    });
    if (!res.ok) throw new Error("Failed to run benchmark");
    return res.json();
  }

  public static async getResults() {
    const res = await fetch("/api/benchmark/results");
    if (!res.ok) throw new Error("Failed to fetch benchmark results");
    return res.json();
  }
}
