import { BenchmarkRunner } from './BenchmarkRunner';
import { BenchmarkDatabase } from './BenchmarkDatabase';

export class BenchmarkCore {
  public static async executeBenchmarkSuite(modelId: string, modelName: string, provider: 'native' | 'llamacpp') {
    return await BenchmarkRunner.execute(modelId, modelName, provider);
  }

  public static async getHistory() {
    return await BenchmarkDatabase.getHistory();
  }
}
