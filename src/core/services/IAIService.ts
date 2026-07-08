export interface IAIService {
  generateEmbedding(text: string): Promise<number[]>;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  getAI(): any;
}
