import { BenchmarkCore } from './BenchmarkCore';
import { ResultAnalyzer } from './ResultAnalyzer';
import { RecommendationEngine } from './RecommendationEngine';

export class DashboardProvider {
  public static async getDashboardData() {
    const history = await BenchmarkCore.getHistory();
    const evaluated = history.map((res: any) => ({
      ...res,
      analysis: ResultAnalyzer.analyze(res),
      recommendations: RecommendationEngine.generateRecommendations(res)
    }));

    const rankings = this.calculateRankings(evaluated);

    return {
      history: evaluated,
      rankings
    };
  }

  private static calculateRankings(history: any[]) {
    const successful = history.filter(h => h.status === 'completed');
    if (successful.length === 0) return null;

    const getBestBy = (sorter: (a: any, b: any) => number) => {
      const sorted = [...successful].sort(sorter);
      return sorted[0];
    };

    return {
      fastest: getBestBy((a, b) => b.metrics.tokensPerSecond - a.metrics.tokensPerSecond),
      mostStable: getBestBy((a, b) => a.metrics.cpuPeak - b.metrics.cpuPeak), 
      bestEfficiency: getBestBy((a, b) => (b.metrics.tokensPerSecond / b.metrics.ramPeak) - (a.metrics.tokensPerSecond / a.metrics.ramPeak)),
      bestOffline: successful[0], 
    };
  }
}
