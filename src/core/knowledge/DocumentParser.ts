import { Container } from '../di/Container';
import { DITokens } from '../di/tokens';
import { IAIService } from '../services/IAIService';

export interface ParsedDocument {
  text: string;
  metadata: {
    language: string;
    wordCount: number;
    charCount: number;
    mimeType: string;
    filename: string;
    hash: string;
    detectedType: string;
    version: number;
    timestamp: string;
  };
}

export class DocumentParser {
  public static async parse(fileBuffer: ArrayBuffer, mimeType: string, filename: string): Promise<ParsedDocument> {
    const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true });
    let text = '';
    let detectedType = 'text';

    const ext = filename.split('.').pop()?.toLowerCase() || '';

    // Generate MD5-like simple content hash
    const hash = this.calculateHash(fileBuffer);

    // 1. Specialized Parsing based on extensions or mime types
    if (ext === 'json' || mimeType.includes('json')) {
      detectedType = 'json';
      try {
        const rawText = textDecoder.decode(fileBuffer);
        const obj = JSON.parse(rawText);
        text = `## JSON Document: ${filename}\n\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
      } catch {
        text = textDecoder.decode(fileBuffer);
      }
    } else if (ext === 'csv' || ext === 'tsv' || mimeType.includes('csv')) {
      detectedType = 'table';
      const rawText = textDecoder.decode(fileBuffer);
      text = this.parseCSVToMarkdown(rawText, ext === 'tsv' ? '\t' : ',');
    } else if (ext === 'yaml' || ext === 'yml') {
      detectedType = 'yaml';
      text = `## YAML Document: ${filename}\n\n\`\`\`yaml\n${textDecoder.decode(fileBuffer)}\n\`\`\``;
    } else if (ext === 'html' || mimeType.includes('html')) {
      detectedType = 'html';
      const rawText = textDecoder.decode(fileBuffer);
      text = this.cleanHTML(rawText);
    } else if (['js', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'sh', 'rb', 'php'].includes(ext)) {
      detectedType = 'code';
      const rawText = textDecoder.decode(fileBuffer);
      text = `## Source Code: ${filename}\n\nLanguage Extension: ${ext}\n\n\`\`\`${ext}\n${rawText}\n\`\`\``;
    } else if (['xml', 'svg'].includes(ext) || mimeType.includes('xml')) {
      detectedType = 'xml';
      const rawText = textDecoder.decode(fileBuffer);
      text = `## XML Document: ${filename}\n\n\`\`\`xml\n${rawText}\n\`\`\``;
    } else if (['pdf', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext) || mimeType.includes('pdf') || mimeType.includes('image')) {
      detectedType = mimeType.includes('image') ? 'image' : 'pdf';
      // Binary file - Use Gemini Multimodal OCR to extract text
      if (process.env.GEMINI_API_KEY) {
        try {
          text = await this.performGeminiOCR(fileBuffer, mimeType, filename);
        } catch (e: any) {
          text = `[Binary Extraction Fallback for ${filename}]:\n` + this.extractPrintableASCII(fileBuffer);
        }
      } else {
        text = `[Offline Binary Extraction for ${filename}]:\n` + this.extractPrintableASCII(fileBuffer);
      }
    } else {
      // Default plain text / markdown
      text = textDecoder.decode(fileBuffer);
      detectedType = ext || 'text';
    }

    // 2. Cleaning & Normalization
    text = this.normalizeText(text);

    // 3. Language Detection (simple heuristic)
    const language = this.detectLanguage(text);

    return {
      text,
      metadata: {
        language,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        charCount: text.length,
        mimeType,
        filename,
        hash,
        detectedType,
        version: 1,
        timestamp: new Date().toISOString()
      }
    };
  }

  private static calculateHash(buffer: ArrayBuffer): string {
    const view = new Uint8Array(buffer);
    let hash = 0;
    for (let i = 0; i < Math.min(view.length, 10000); i++) {
      hash = (hash << 5) - hash + view[i];
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}_${view.length}`;
  }

  private static parseCSVToMarkdown(csv: string, separator: string): string {
    const lines = csv.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    
    let markdown = `### Tabular Data\n\n`;
    const headers = lines[0].split(separator);
    markdown += `| ${headers.join(' | ')} |\n`;
    markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
    
    for (let i = 1; i < Math.min(lines.length, 100); i++) {
      const cells = lines[i].split(separator);
      markdown += `| ${cells.join(' | ')} |\n`;
    }
    
    if (lines.length > 100) {
      markdown += `\n*Showing first 100 rows. Total rows: ${lines.length}*\n`;
    }
    return markdown;
  }

  private static cleanHTML(html: string): string {
    // Basic tag stripping & formatting
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return `### Cleaned Webpage Content\n\n${clean}`;
  }

  private static extractPrintableASCII(buffer: ArrayBuffer): string {
    const view = new Uint8Array(buffer);
    let out = '';
    let len = Math.min(view.length, 10000);
    for (let i = 0; i < len; i++) {
      const code = view[i];
      if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
        out += String.fromCharCode(code);
      } else if (code === 0) {
        out += ' ';
      }
    }
    return out.replace(/\s+/g, ' ').trim().slice(0, 3000) + '\n\n[Truncated Printable stream]';
  }

  private static async performGeminiOCR(buffer: ArrayBuffer, mimeType: string, filename: string): Promise<string> {
    const base64 = Buffer.from(buffer).toString('base64');
    const systemPrompt = "You are an advanced layout-preserving Document Parser. Extract all text, layout, headers, tables, and structures from this document into clean, high-fidelity Markdown. If it is an image, describe it thoroughly in context of the text.";
    const ai = Container.resolve<IAIService>(DITokens.AIService).getAI();
    
    // Fallback mimeType if unrecognized/generic
    let finalMime = mimeType;
    if (!mimeType || mimeType === 'application/octet-stream') {
      if (filename.endsWith('.pdf')) finalMime = 'application/pdf';
      else if (filename.endsWith('.png')) finalMime = 'image/png';
      else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) finalMime = 'image/jpeg';
      else finalMime = 'image/png'; // Default guess
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: base64,
            mimeType: finalMime
          }
        },
        "Extract and transcribe all content from this file into high-fidelity markdown format."
      ],
      config: {
        systemInstruction: systemPrompt
      }
    });

    return response.text || '';
  }

  private static normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private static detectLanguage(text: string): string {
    const sample = text.slice(0, 1000).toLowerCase();
    if (sample.includes(' the ') || sample.includes(' and ') || sample.includes(' of ')) return 'English';
    if (sample.includes(' di ') || sample.includes(' della ') || sample.includes(' e ') || sample.includes(' il ')) return 'Italiano';
    if (sample.includes(' der ') || sample.includes(' die ') || sample.includes(' und ') || sample.includes(' das ')) return 'Deutsch';
    if (sample.includes(' el ') || sample.includes(' la ') || sample.includes(' de ') || sample.includes(' que ')) return 'Español';
    if (sample.includes(' le ') || sample.includes(' la ') || sample.includes(' et ') || sample.includes(' une ')) return 'Français';
    return 'English'; // Default fallback
  }
}
