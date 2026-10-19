import express, { Express } from "express";
import cors from "cors";
import { genericErrorHandler } from "./middlewares/error.middleware.js";
import v1Router from "./routes/v1/index.route.js";
import helmet from "helmet";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(helmet());

  app.use("/api/v1", v1Router);

  app.use(genericErrorHandler);

  return app;
}
