const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/core/services/ModelService.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(\!res\.ok\) throw new Error\("Failed to install model"\);/g, `if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to install model");
    }`);

fs.writeFileSync(file, content);
