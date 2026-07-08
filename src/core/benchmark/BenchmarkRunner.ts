import { BenchmarkService } from '../services/BenchmarkService';

export class BenchmarkRunner {
  public static async execute(modelId: string, modelName: string, provider: 'native' | 'llamacpp') {
    return await BenchmarkService.runBenchmark(modelId, modelName, provider);
  }
}
