import { RuntimeManager } from "../modules/runtime/RuntimeManager";
import { GeminiRuntime } from "../modules/runtime/GeminiRuntime";
import { InferenceEngine } from "../modules/inference/InferenceEngine";
import { KnowledgeEngine } from "../modules/knowledge/KnowledgeEngine";

import { DatabaseLayer } from "../modules/database/DatabaseLayer";
import { ModelManager } from "../modules/model/ModelManager";
import { HardwareDetectionEngine } from "../modules/hardware/HardwareDetectionEngine";
import { MemoryEngine } from "../modules/memory/MemoryEngine";
import { PluginEngine } from "../modules/plugin/PluginEngine";
import { ChatService } from "../modules/chat/ChatService";
import { DashboardService } from "../modules/dashboard/DashboardService";

import { ConfigManager } from "./config/ConfigManager";
import { Logger } from "./logger/Logger";
import { ErrorHandler } from "./errors/ErrorHandler";
import { DIContainer } from "./di/Container";

/**
 * Core Engine - Central Orchestrator
 * Bootstraps the platform and manages module lifecycles.
 */

export class CoreEngine {
    private static instance: CoreEngine;
    private isInitialized = false;

    public runtimeManager!: RuntimeManager;
    public inferenceEngine!: InferenceEngine;
    public knowledgeEngine!: KnowledgeEngine;
    
    public databaseLayer!: DatabaseLayer;
    public modelManager!: ModelManager;
    public hardwareDetection!: HardwareDetectionEngine;
    public memoryEngine!: MemoryEngine;
    public pluginEngine!: PluginEngine;
    public chatService!: ChatService;
    public dashboardService!: DashboardService;

    public configManager!: ConfigManager;
    public logger!: Logger;
    public errorHandler!: ErrorHandler;
    public diContainer!: DIContainer;

    private constructor() {}

    public static getInstance(): CoreEngine {
        if (!CoreEngine.instance) {
            CoreEngine.instance = new CoreEngine();
        }
        return CoreEngine.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        // 1. Initialize core system modules
        this.configManager = ConfigManager.getInstance();
        this.logger = Logger.getInstance();
        this.errorHandler = ErrorHandler.getInstance();
        this.diContainer = DIContainer.getInstance();

        this.logger.info("Initializing Core Engine subsystems...");

        // Register core systems in DI container
        this.diContainer.register("ConfigManager", this.configManager);
        this.diContainer.register("Logger", this.logger);
        this.diContainer.register("ErrorHandler", this.errorHandler);
        
        // 2. Initialize application modules
        this.databaseLayer = new DatabaseLayer();
        this.hardwareDetection = new HardwareDetectionEngine();
        this.memoryEngine = new MemoryEngine();
        this.modelManager = new ModelManager();
        this.runtimeManager = new RuntimeManager();
        this.inferenceEngine = new InferenceEngine(this.runtimeManager);
        this.knowledgeEngine = new KnowledgeEngine();
        this.pluginEngine = new PluginEngine();
        this.chatService = new ChatService();
        this.dashboardService = new DashboardService();
        
        // Register application modules in DI container
        this.diContainer.register("DatabaseLayer", this.databaseLayer);
        this.diContainer.register("HardwareDetectionEngine", this.hardwareDetection);
        this.diContainer.register("MemoryEngine", this.memoryEngine);
        this.diContainer.register("ModelManager", this.modelManager);
        this.diContainer.register("RuntimeManager", this.runtimeManager);
        this.diContainer.register("InferenceEngine", this.inferenceEngine);
        this.diContainer.register("KnowledgeEngine", this.knowledgeEngine);
        this.diContainer.register("PluginEngine", this.pluginEngine);
        this.diContainer.register("ChatService", this.chatService);
        this.diContainer.register("DashboardService", this.dashboardService);

        // Initialize modules
        await this.databaseLayer.connect();
        await this.hardwareDetection.detectHardware();
        await this.memoryEngine.initialize();
        await this.modelManager.initialize();
        await this.knowledgeEngine.initialize();
        await this.pluginEngine.initialize();
        await this.chatService.initialize(this.databaseLayer);
        await this.dashboardService.initialize();

        // Mount physical runtime adapters
        const geminiRuntime = new GeminiRuntime();
        this.runtimeManager.registerRuntime(geminiRuntime);
        
        // Start the proxy runtime immediately if possible
        await this.runtimeManager.startRuntime(geminiRuntime.id).catch(e => {
            this.logger.warn("Failed to start Gemini runtime proxy", e);
        });

        this.isInitialized = true;
        this.logger.info("Core Engine initialized successfully.");
    }

    public getStatus(): object {
        return {
            status: "online",
            initialized: this.isInitialized,
            version: "0.1.0",
            modules: {
                configManager: "active",
                logger: "active",
                errorHandler: "active",
                diContainer: "active",
                databaseLayer: this.databaseLayer.getStatus(),
                hardwareDetection: this.hardwareDetection.getStatus(),
                memoryEngine: this.memoryEngine.getStatus(),
                modelManager: this.modelManager.getStatus(),
                runtimeManager: "active",
                inferenceEngine: "active",
                knowledgeEngine: this.knowledgeEngine.getStatus(),
                pluginEngine: this.pluginEngine.getStatus(),
                chatService: this.chatService.getStatus()
            }
        };
    }
}


