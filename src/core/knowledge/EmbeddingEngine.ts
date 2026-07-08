import { Container } from '../di/Container';
import { DITokens } from '../di/tokens';
import { IAIService } from '../services/IAIService';

export class EmbeddingEngine {
  public static async generateEmbedding(text: string): Promise<number[]> {
    return Container.resolve<IAIService>(DITokens.AIService).generateEmbedding(text);
  }

  public static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.generateEmbedding(t)));
  }
}

