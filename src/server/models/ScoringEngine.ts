import { CompatibilityEngine } from './CompatibilityEngine';

export class ScoringEngine {
  public static scoreModels(models: any[], hardware: any) {
    return models.map(m => {
      const compatibility = CompatibilityEngine.evaluate(m, hardware);
      
      let codingQuality = 50;
      let chatQuality = 60;
      let ragQuality = 50;
      let agentQuality = 40;
      let overallScore = 0;

      const lowerId = m.id.toLowerCase();
      const lowerName = m.name.toLowerCase();

      // Heuristics based on model names
      if (lowerId.includes("coder") || lowerName.includes("coder") || lowerId.includes("deepseek")) codingQuality += 40;
      if (lowerId.includes("instruct") || lowerId.includes("chat")) chatQuality += 30;
      if (m.context_length >= 32000) ragQuality += 40;
      else if (m.context_length >= 8192) ragQuality += 20;
      
      if (codingQuality > 95) agentQuality += 40; // Usually good coders make good agents

      // Normalize max 100
      codingQuality = Math.min(100, codingQuality);
      chatQuality = Math.min(100, chatQuality);
      ragQuality = Math.min(100, ragQuality);
      agentQuality = Math.min(100, agentQuality);

      // Base score on qualities + compatibility
      overallScore = (codingQuality + chatQuality + ragQuality + agentQuality) / 4;
      overallScore = (overallScore * 0.6) + (compatibility.score * 0.4);

      return {
        ...m,
        scores: {
          coding: codingQuality,
          chat: chatQuality,
          rag: ragQuality,
          agent: agentQuality,
          overall: Math.round(overallScore)
        },
        compatibility
      };
    });
  }
}
