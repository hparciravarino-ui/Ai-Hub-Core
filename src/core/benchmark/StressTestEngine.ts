import { BenchmarkCore } from './BenchmarkCore';

export class StressTestEngine {
  public static async runStressTest(modelId: string, modelName: string, provider: 'native' | 'llamacpp', iterations: number) {
    const results = [];
    for (let i = 0; i < iterations; i++) {
      const res = await BenchmarkCore.executeBenchmarkSuite(modelId, modelName, provider);
      results.push(res);
    }
    return results;
  }
}
