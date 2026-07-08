import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'benchmark_results.json');

export class BenchmarkDatabase {
  public static async saveResult(result: any) {
    const results = await this.getAllResults();
    results.push({
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(DB_PATH, JSON.stringify(results, null, 2));
  }

  public static async getAllResults() {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  public static async clear() {
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
  }
}
