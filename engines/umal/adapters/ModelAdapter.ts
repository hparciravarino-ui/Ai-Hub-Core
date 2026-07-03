import { NormalizedPrompt, NormalizedOutput } from "../types";

export interface ModelAdapter {
    family: string;
    applyTemplate(prompt: NormalizedPrompt): any;
    parseOutput(output: any): any;
}

export class LlamaAdapter implements ModelAdapter {
    family = "Llama 3";

    applyTemplate(prompt: NormalizedPrompt): any {
        let formatted = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${prompt.systemPrompt}<|eot_id|>\n`;
        for (const msg of prompt.messages) {
            formatted += `<|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>\n`;
        }
        formatted += `<|start_header_id|>assistant<|end_header_id|>\n\n`;
        return formatted;
    }

    parseOutput(output: any): any {
        return output; // Basic pass-through for simulation
    }
}

export class PhiAdapter implements ModelAdapter {
    family = "Phi";

    applyTemplate(prompt: NormalizedPrompt): any {
        let formatted = `<|system|>\n${prompt.systemPrompt}<|end|>\n`;
        for (const msg of prompt.messages) {
            formatted += `<|${msg.role}|>\n${msg.content}<|end|>\n`;
        }
        formatted += `<|assistant|>\n`;
        return formatted;
    }

    parseOutput(output: any): any {
        return output;
    }
}
