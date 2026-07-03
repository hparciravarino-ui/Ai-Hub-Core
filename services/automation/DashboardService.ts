import { Logger } from "../../core/logging/Logger";
import { Kernel } from "../../core/kernel/Kernel";
import { DIContainer } from "../../core/dependency-injection/Container";
import { DatabaseLayer } from "../../database/sqlite/DatabaseLayer";
import { MemoryEngine } from "../../engines/memory/MemoryEngine";
import { PluginEngine } from "../plugins/PluginEngine";

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
    const kernel = Kernel.getInstance();
    const kernelStatus = kernel.getStatus();
    const di = DIContainer.getInstance();

    let dbStatus = { status: "offline" };
    try {
      dbStatus = di.resolve<DatabaseLayer>("DatabaseLayer").getStatus() as any;
    } catch {}

    let memoryStatus = { status: "offline" };
    try {
      memoryStatus = di.resolve<MemoryEngine>("MemoryEngine").getStatus() as any;
    } catch {}

    let pluginsStatus = { status: "offline" };
    try {
      pluginsStatus = di.resolve<PluginEngine>("PluginEngine").getStatus() as any;
    } catch {}

    return {
      status: this.isInitialized ? "online" : "offline",
      systemStatus: kernelStatus,
      activeModules: 6,
      memory: memoryStatus,
      database: dbStatus,
      inference: { status: "active", engine: "online-proxy" },
      plugins: pluginsStatus
    };
  }
}
