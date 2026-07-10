const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/hooks/useAppState.ts');
let content = fs.readFileSync(file, 'utf8');

// We need to import ModelService
if (!content.includes('ModelService')) {
  content = content.replace('import { DEFAULT_MODELS, Model } from "../data";', 'import { DEFAULT_MODELS, Model } from "../data";\nimport { ModelService } from "../core/services/ModelService";');
}

const replacement = `  const handleDownloadModel = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    try {
      addAuditLog("System", \`Richiesta di installazione del modello '\${model.name}'\`, "Success");
      await ModelService.installModel(model);
      // In a real scenario, this would update the model's downloaded status.
      setModels((prevModels) =>
        prevModels.map((m) => m.id === modelId ? { ...m, downloaded: true } : m)
      );
      alert(\`Modello \${model.name} installato con successo!\`);
    } catch (e: any) {
      console.error(e);
      addAuditLog("System", \`Errore installazione: \${e.message}\`, "Warning");
      alert(\`Impossibile installare \${model.name}: \${e.message}\`);
    }
  };`;

content = content.replace(/const handleDownloadModel \= \(modelId\: string\) \=\> \{[\s\S]*?return \{ \.\.\.currM\, downloadProgress\: Math\.min\(100\, nextProgress\) \}\;\n                \}\n                return currM\;\n              \}\)\n            \)\;\n          \}\, delay\)\;\n          return \{ \.\.\.m\, isDownloading\: true\, downloadProgress\: 0 \}\;\n        \}\n        return m\;\n      \}\)\n    \)\;\n  \}\;/, replacement);

fs.writeFileSync(file, content);
