import { BenchmarkService } from '../services/BenchmarkService';

export class BenchmarkRunner {
  public static async execute(modelId: string, modelName: string, provider: 'ollama' | 'llamacpp') {
    return await BenchmarkService.runBenchmark(modelId, modelName, provider);
  }
}
