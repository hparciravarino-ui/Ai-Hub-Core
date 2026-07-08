import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { setupServer } from "./src/server/setup";
import { apiRouter } from "./src/server/routes";

async function startServer() {
  const app = express();
  
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite dev server compatibility
  }));
  app.use(cors({ origin: "*" }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs for enterprise internal tooling
    message: "Too many requests from this IP, please try again later."
  });
  app.use("/api", limiter);
  
  app.use(express.json({ limit: "50mb" }));

  // Initialize System
  await setupServer();

  const PORT = 3000;

  // Mount API routes
  app.use("/api", apiRouter);

  // Vite middleware for development / SPA static server for production
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
    console.log(`Enterprise Core Server running on http://localhost:${PORT}`);
  });
}

startServer();
