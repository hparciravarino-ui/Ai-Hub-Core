const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/server/routes/installation.ts');
let content = fs.readFileSync(file, 'utf8');

const replacement = `
// 4. SERVICES MANAGEMENT
installationRouter.get("/services", async (req, res) => {
  const os = require('os');
  
  // Actually check port 11434 for local_llm
  let isOllamaRunning = false;
  try {
    const net = require('net');
    isOllamaRunning = await new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', (err) => resolve(err.code !== 'EADDRINUSE'));
      server.once('listening', () => {
        server.close();
        resolve(true); // Port is free, meaning not running
      });
      server.listen(11434);
    }).then(isFree => !isFree);
  } catch(e) {}

  const realServiceStates = {
    app_server: { 
      status: "Active", 
      pid: process.pid, 
      uptime: Math.floor(process.uptime()), 
      port: process.env.PORT || 3000, 
      logs: ["Main full-stack application running"] 
    },
    local_llm: { 
      status: isOllamaRunning ? "Active" : "Inactive", 
      pid: isOllamaRunning ? "Unknown" : null, 
      uptime: 0, 
      port: 11434, 
      logs: isOllamaRunning ? ["Local LLM is running on host"] : ["Ollama/Llama.cpp local server inactive", "Install and run externally"] 
    },
  };
  res.json(realServiceStates);
});

installationRouter.post("/services/control", (req, res) => {
  const { service, action } = req.body;
  if (service === "app_server") {
    return res.status(400).json({ error: "Cannot stop the main app server from within itself." });
  }
  return res.status(400).json({ error: \`Cannot control external service '\${service}' from this sandbox.\` });
});
`;

content = content.replace(/\/\/\ 4\. SERVICES MANAGEMENT[\s\S]*?\/\/\ 5\. DIAGNOSTICS & HEALTH CHECK/, replacement + "\n// 5. DIAGNOSTICS & HEALTH CHECK");

fs.writeFileSync(file, content);
