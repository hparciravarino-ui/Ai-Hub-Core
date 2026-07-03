import { Logger } from "../../core/logger/Logger";
import { CoreEngine } from "../../core/CoreEngine";

export class DashboardService {
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public async initialize(): Promise<void> {
    this.logger.info("Initializing DashboardService...");
    this.isInitialized = true;
    this.logger.info("DashboardService initialized.");
  }

  public getDashboardMetrics() {
    const core = CoreEngine.getInstance();
    const coreStatus = core.getStatus() as any;
    
    return {
      status: this.isInitialized ? "online" : "offline",
      systemStatus: coreStatus,
      activeModules: Object.keys(coreStatus.modules || {}).length,
      memory: core.memoryEngine.getStatus(),
      database: core.databaseLayer.getStatus(),
      inference: { status: "active", engine: "default" },
      plugins: core.pluginEngine.getStatus()
    };
  }
}
