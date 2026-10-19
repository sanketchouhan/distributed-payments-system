import express, { Express, Request, Response } from "express";
import cors from "cors";
import { genericErrorHandler } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import { proxyServices } from "./services/proxy.service.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";

export function createApp(): Express {
  const app = express();

  app.use(requestLogger);
  app.use(cors());
  app.use(helmet());

  // Health check endpoint
  app.get("/api/v1/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Service routes
  proxyServices(app);

  app.use(genericErrorHandler);

  return app;
}
