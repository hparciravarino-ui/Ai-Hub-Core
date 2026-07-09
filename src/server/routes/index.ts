import { Router } from "express";
import { healthRouter } from "./health";
import { hardwareRouter } from "./hardware";
import { modelsRouter } from "./models";
import { benchmarkRouter } from "./benchmark";
import { knowledgeRouter } from "./knowledge";
import { vectorRouter } from "./vector";
import { agentsRouter } from "./agents";
import { workflowsRouter } from "./workflows";
import { memoryRouter } from "./memory";
import { securityRouter } from "./security";
import { pluginsRouter } from "./plugins";
import { desktopRouter } from "./desktop";
import { telemetryRouter } from "./telemetry";
import { qaRouter } from "./qa";
import { packagingRouter } from "./packaging";
import { installationRouter } from "./installation";
import { providersRouter } from "./providers";
import { filesRouter } from "./files";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/hardware", hardwareRouter);
apiRouter.use("/models", modelsRouter);
apiRouter.use("/benchmark", benchmarkRouter);
apiRouter.use("/knowledge", knowledgeRouter);
apiRouter.use("/vector", vectorRouter);
apiRouter.use("/agents", agentsRouter);
apiRouter.use("/workflows", workflowsRouter);
apiRouter.use("/memory", memoryRouter);
apiRouter.use("/setup", installationRouter);
apiRouter.use("/providers", providersRouter);
apiRouter.use("/files", filesRouter);

// Enterprise APIs
apiRouter.use("/enterprise/security", securityRouter);
apiRouter.use("/enterprise/plugins", pluginsRouter);
apiRouter.use("/enterprise/desktop", desktopRouter);
apiRouter.use("/enterprise/telemetry", telemetryRouter);
apiRouter.use("/enterprise/qa", qaRouter);
apiRouter.use("/enterprise/packaging", packagingRouter);
