import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Import core kernel and dependency injection
import { Kernel } from "./core/kernel/Kernel";
import { DIContainer } from "./core/dependency-injection/Container";

// Import concrete systems
import { DatabaseLayer } from "./database/sqlite/DatabaseLayer";
import { MemoryEngine } from "./engines/memory/MemoryEngine";
import { HardwareEngine } from "./engines/hardware/HardwareEngine";
import { PerformanceEngine } from "./engines/optimization/PerformanceEngine";
import { ModelManager } from "./services/models/ModelManager";
import { PluginEngine } from "./services/plugins/PluginEngine";
import { RuntimeManager } from "./engines/runtime/RuntimeManager";
import { GeminiRuntime } from "./engines/runtime/GeminiRuntime";
import { InferenceEngine } from "./engines/inference/InferenceEngine";
import { KnowledgeEngine } from "./engines/knowledge/KnowledgeEngine";
import { LearningEngine } from "./engines/learning/LearningEngine";
import { ChatService } from "./services/chat/ChatService";
import { DashboardService } from "./services/automation/DashboardService";
import { AIOrchestrator } from "./engines/ai-orchestrator/AIOrchestrator";

// Import API layer
import { apiRouter } from "./api/rest/Router";
import { SocketServer } from "./api/websocket/SocketServer";
import { IPCHandler } from "./api/ipc/IPCHandler";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // --- BOOTSTRAP ENTERPRISE KERNEL ---
  const kernel = Kernel.getInstance();
  await kernel.bootstrap();
  const di = DIContainer.getInstance();

  // --- INITIALIZE INDEPENDENT MOTORS ---
  const dbLayer = new DatabaseLayer();
  await dbLayer.connect();
  di.register("DatabaseLayer", dbLayer);

  const memoryEngine = new MemoryEngine();
  await memoryEngine.initialize();
  di.register("MemoryEngine", memoryEngine);

  const hardwareEngine = HardwareEngine.getInstance();
  hardwareEngine.startContinuousMonitoring(5000);
  di.register("HardwareEngine", hardwareEngine);

  const performanceEngine = PerformanceEngine.getInstance();
  di.register("PerformanceEngine", performanceEngine);

  const modelManager = new ModelManager();
  di.register("ModelManager", modelManager);

  const pluginEngine = new PluginEngine();
  di.register("PluginEngine", pluginEngine);

  // Set up model runtime environment
  const runtimeManager = new RuntimeManager();
  const geminiRuntime = new GeminiRuntime();
  runtimeManager.registerRuntime(geminiRuntime);
  await geminiRuntime.start();
  di.register("RuntimeManager", runtimeManager);

  const inferenceEngine = new InferenceEngine(runtimeManager);
  di.register("InferenceEngine", inferenceEngine);

  const aiOrchestrator = new AIOrchestrator();
  aiOrchestrator.setInferenceEngine(inferenceEngine);
  di.register("AIOrchestrator", aiOrchestrator);

  const knowledgeEngine = new KnowledgeEngine();
  await knowledgeEngine.initialize();
  di.register("KnowledgeEngine", knowledgeEngine);

  const learningEngine = new LearningEngine();
  await learningEngine.initialize();
  di.register("LearningEngine", learningEngine);

  // Set up chat services with DB injection
  const chatService = new ChatService();
  await chatService.initialize(dbLayer);
  di.register("ChatService", chatService);

  const dashboardService = new DashboardService();
  await dashboardService.initialize();
  di.register("DashboardService", dashboardService);

  // Start socket server and native IPC messaging layers
  const socketServer = new SocketServer();
  await socketServer.initialize();
  
  const ipcHandler = new IPCHandler();
  await ipcHandler.initialize();

  // --- MOUNT UNIFIED API ROUTER ---
  app.use("/api", apiRouter);

  // --- ERROR HANDLING MIDDLEWARE ---
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    kernel.errorHandler.handleError(err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        isOperational: kernel.errorHandler.isTrustedError(err)
      }
    });
  });

  // --- PRESENTATION LAYER (VITE MIDDLEWARE) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    kernel.logger.info(`Enterprise Modular Platform active. API server running on port ${PORT}`);
  });
}

startServer();

