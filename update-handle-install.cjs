const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/models/EnterpriseModelDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/catch \(e\) \{\n\s*console\.error\(e\);\n\s*setInstalling\(null\);\n\s*\}/, `catch (e: any) {
      console.error(e);
      setInstalling(null);
      alert(e.message || "Errore durante l'installazione del modello.");
    }`);

fs.writeFileSync(file, content);
