export class RecommendationEngine {
  public static getRecommendations(scoredModels: any[]) {
    // Only recommend models that are compatible (score > 0)
    const validModels = scoredModels.filter(m => m.compatibility.score > 0);

    const getBest = (metric: string, condition?: (m: any) => boolean) => {
      let filtered = condition ? validModels.filter(condition) : validModels;
      if (filtered.length === 0) return null;
      return filtered.reduce((best, current) => {
        return (current.scores[metric] > (best.scores[metric] || 0)) ? current : best;
      });
    };

    return {
      bestCoding: getBest("coding", m => m.scores.coding > 70),
      bestReasoning: getBest("overall", m => m.scores.overall > 80 && m.type === "api"), // DeepSeek API usually
      bestChat: getBest("chat", m => m.scores.chat > 70),
      bestRag: getBest("rag", m => m.scores.rag > 70),
      bestLightweight: getBest("overall", m => m.type === "local" && m.sizeEstimate < 5),
      bestOffline: getBest("overall", m => m.type === "local")
    };
  }
}
