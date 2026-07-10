const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/hooks/useAppState.ts');
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('const handleDownloadModel = (modelId: string) => {');
const endIdx = content.indexOf('const handleDeleteModel = (modelId: string) => {');

if (startIdx !== -1 && endIdx !== -1) {
  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx);
  const replacement = `const handleDownloadModel = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    try {
      addAuditLog("System", \`Richiesta di installazione del modello '\${model.name}'\`, "Success");
      await ModelService.installModel(model);
      setModels((prevModels) =>
        prevModels.map((m) => m.id === modelId ? { ...m, downloaded: true } : m)
      );
      alert(\`Modello \${model.name} installato con successo!\`);
    } catch (e: any) {
      console.error(e);
      addAuditLog("System", \`Errore installazione: \${e.message}\`, "Warning");
      alert(\`Impossibile installare \${model.name}: \${e.message}\`);
    }
  };

  `;
  content = before + replacement + after;
  fs.writeFileSync(file, content);
} else {
  console.log("Could not find start or end index.");
}
