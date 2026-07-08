import { BenchmarkService } from '../services/BenchmarkService';

export class BenchmarkDatabase {
  public static async getHistory() {
    return await BenchmarkService.getResults();
  }
}
