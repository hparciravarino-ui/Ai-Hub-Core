import fs from "fs";
import path from "path";
import { Logger } from "../../core/logging/Logger";
import { DIContainer } from "../../core/dependency-injection/Container";
import { DatabaseLayer } from "../../database/sqlite/DatabaseLayer";
import { documents } from "../../database/sqlite/schema";

export interface AnalysisSummary {
    framework: string;
    dependenciesCount: number;
    hasDocker: boolean;
    hasCICD: boolean;
    filesScanned: number;
    directoriesScanned: number;
}

export class ProjectAnalyzer {
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public async initialize(): Promise<void> {
        this.logger.info("[Project Analyzer] Ready to scan, index, and map repository workspaces.");
    }

    public async analyzeWorkspace(workspacePath: string): Promise<AnalysisSummary> {
        this.logger.info(`[Project Analyzer] Starting static code analysis on: ${workspacePath}`);
        
        let filesScanned = 0;
        let directoriesScanned = 0;
        let framework = "Vanilla Node/TS";
        let dependenciesCount = 0;
        let hasDocker = false;
        let hasCICD = false;

        const scanDir = (dir: string) => {
            if (dir.includes("node_modules") || dir.includes(".git") || dir.includes("dist")) return;
            
            try {
                const list = fs.readdirSync(dir);
                directoriesScanned++;
                
                for (const item of list) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDir(fullPath);
                    } else {
                        filesScanned++;
                        
                        // Detect systems/frameworks dynamically
                        if (item === "package.json") {
                            const pkg = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
                            dependenciesCount = Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
                            if (pkg.dependencies?.react) {
                                framework = "React with Vite";
                            }
                        } else if (item.toLowerCase() === "dockerfile") {
                            hasDocker = true;
                        } else if (fullPath.includes(".github/workflows")) {
                            hasCICD = true;
                        }
                    }
                }
            } catch (e: any) {
                this.logger.warn(`[Project Analyzer] Skip directory scan on ${dir} due to: ${e.message}`);
            }
        };

        // Execute scan starting at workspace root
        scanDir(workspacePath);

        const summary: AnalysisSummary = {
            framework,
            dependenciesCount,
            hasDocker,
            hasCICD,
            filesScanned,
            directoriesScanned
        };

        this.logger.info(`[Project Analyzer] Analysis completed. Framework: ${framework}, Files: ${filesScanned}`);

        // Save scan metadata in Knowledge Base schema
        try {
            const container = DIContainer.getInstance();
            const dbLayer = container.resolve<DatabaseLayer>("DatabaseLayer");
            
            await dbLayer.db.insert(documents).values({
                id: "analysis_" + Date.now(),
                name: `Project Scan - ${path.basename(workspacePath)}`,
                content: JSON.stringify(summary, null, 2),
                createdAt: new Date().toISOString()
            }).execute();
        } catch (e: any) {
            this.logger.error(`[Project Analyzer] Failed to store scan inside database: ${e.message}`);
        }

        return summary;
    }

    public getStatus(): object {
        return {
            status: "active",
            supportedConfigurations: ["package.json", "tsconfig.json", "Dockerfile", "GitHub Workflows"]
        };
    }
}
