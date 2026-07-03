import { GoogleGenAI } from "@google/genai";
import { IRuntime } from "./RuntimeManager";
import { Logger } from "../../core/logging/Logger";

export class GeminiRuntime implements IRuntime {
    public id = "core_engine_default";
    public name = "Core Engine Proxy (Online)";
    public isAvailable = false;
    private ai: GoogleGenAI | null = null;
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async start(): Promise<void> {
        this.logger.info(`[Gemini Runtime] Launching model proxy runtime...`);
        if (process.env.GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            this.isAvailable = true;
            this.logger.info(`[Gemini Runtime] Online and operational.`);
        } else {
            this.logger.warn(`[Gemini Runtime] Missing GEMINI_API_KEY. Local model proxy offline.`);
        }
    }

    public async stop(): Promise<void> {
        this.ai = null;
        this.isAvailable = false;
        this.logger.info(`[Gemini Runtime] Proxy deactivated.`);
    }

    public async generateText(prompt: string, history?: any[], systemInstruction?: string): Promise<string> {
        if (!this.ai) {
            throw new Error("Il client Google GenAI non è configurato. Inserisci la tua API Key.");
        }

        const contents: any[] = [];
        
        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }
        }

        contents.push({
            role: 'user',
            parts: [{ text: prompt }]
        });

        const config: any = {};
        if (systemInstruction) {
             config.systemInstruction = systemInstruction;
        }

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: config
            });

            return response.text || "Nessuna risposta generata.";
        } catch (error: any) {
            this.logger.error("[Gemini Runtime] Error generating text:", error);
            throw new Error(`Inference engine error: ${error.message}`);
        }
    }
}
