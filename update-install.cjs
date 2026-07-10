const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/server/routes/installation.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace mock dependencies/repair
content = content.replace(
  /installationRouter\.post\("\/dependencies\/repair"[\s\S]*?\/\/\ 4\. SERVICES MANAGEMENT/,
  `const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

installationRouter.post("/dependencies/repair", async (req, res) => {
  try {
    diagnosticLogs.push("Wrench: Repair operation triggered by User.");
    diagnosticLogs.push("Wrench: Running npm install to verify and repair dependencies...");
    
    try {
      const { stdout, stderr } = await execPromise("npm install", { cwd: process.cwd() });
      diagnosticLogs.push("Wrench: npm install output:");
      diagnosticLogs.push(stdout.substring(0, 500) + (stdout.length > 500 ? "..." : ""));
    } catch(err) {
      diagnosticLogs.push("Wrench Error: " + err.message);
      return res.status(500).json({ error: "Failed to repair dependencies", logs: diagnosticLogs });
    }

    const packageJsonPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    
    diagnosticLogs.push(\`Wrench: Verified \${deps.length} dependencies and \${devDeps.length} devDependencies.\`);
    
    res.json({
      success: true,
      verifiedCount: deps.length + devDeps.length,
      logs: diagnosticLogs.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. SERVICES MANAGEMENT`
);

fs.writeFileSync(file, content);
