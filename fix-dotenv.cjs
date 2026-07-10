const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('dotenv.config()')) {
  content = 'import dotenv from "dotenv";\ndotenv.config();\n' + content;
  fs.writeFileSync(file, content);
}
