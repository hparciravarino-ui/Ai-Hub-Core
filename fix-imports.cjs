const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/server/routes/installation.ts');
let content = fs.readFileSync(file, 'utf8');

// Use proper import instead of require
content = content.replace(/const \{ exec \} = require\("child_process"\);\nconst util = require\("util"\);\nconst execPromise = util\.promisify\(exec\);/, '');

// Add to imports at top
if (!content.includes('import { exec }')) {
  content = content.replace('import os from "os";', 'import os from "os";\nimport { exec } from "child_process";\nimport util from "util";\nconst execPromise = util.promisify(exec);');
}

// Fix diagnostics require
content = content.replace(/const os = require\('os'\);/, '');
content = content.replace(/const si = require\('systeminformation'\);/, '');
if (!content.includes('import si from "systeminformation"')) {
  content = content.replace('import os from "os";', 'import os from "os";\nimport si from "systeminformation";');
}
content = content.replace(/require\('fs'\)/g, 'fs');

fs.writeFileSync(file, content);
