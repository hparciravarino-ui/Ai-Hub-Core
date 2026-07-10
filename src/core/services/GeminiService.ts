import { GoogleGenAI } from "@google/genai";
import { IAIService } from "./IAIService";

export class GeminiService implements IAIService {
  private aiInstance: GoogleGenAI | null = null;

  public getAI(): GoogleGenAI {
    if (!this.aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to robust offline embeddings and completions.");
      }
      this.aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return this.aiInstance;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Chiave GEMINI_API_KEY non configurata sul server (variabile d'ambiente mancante).");
    }
    try {
      const ai = this.getAI();
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text
      });
      const res = response as any;
      if (res && res.embedding && res.embedding.values) {
        return res.embedding.values;
      }
      if (res && res.embeddings && res.embeddings.values) {
        return res.embeddings.values;
      }
      return this.generateMockEmbedding(text, 1536);
    } catch (e: any) {
      console.error("Error generating Gemini embedding:", e.message);
      throw e;
    }
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Chiave GEMINI_API_KEY non configurata sul server (variabile d'ambiente mancante).");
    }
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
      });
      return response.text || "";
    } catch (e: any) {
      console.error("Error calling Gemini generateContent:", e.message);
      throw e;
    }
  }

  public generateMockEmbedding(text: string, dimensions = 1536): number[] {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const vector: number[] = [];
    let seed = hash;
    for (let i = 0; i < dimensions; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      vector.push((seed / 233280) * 2 - 1);
    }
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(v => v / (mag || 1));
  }
}
