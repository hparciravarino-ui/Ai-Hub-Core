const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/core/models/DownloadUpdateManager.ts');
let content = fs.readFileSync(file, 'utf8');

const replacement = `import { eventBus } from '../events/EventBus';

export class DownloadUpdateManager {
  private static activeDownloads: Map<string, number> = new Map();

  public static async checkUpdates(catalog: any[]) {
    // In sandbox, we don't have local updates
    return [];
  }

  public static async downloadModel(modelId: string, sourceUrl: string) {
    // Esplicita modalità offline / sandbox
    throw new Error("Operazione annullata: in questo ambiente containerizzato, il download di modelli GGUF locali multi-gigabyte è disabilitato (Modalità Sandbox). Utilizza provider API esterni o connettiti a un'istanza Ollama/LMStudio esterna.");
  }
}
`;

fs.writeFileSync(file, replacement);
