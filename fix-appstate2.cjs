const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/hooks/useAppState.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { ModelService }')) {
  content = 'import { ModelService } from "../core/services/ModelService";\n' + content;
  fs.writeFileSync(file, content);
}
