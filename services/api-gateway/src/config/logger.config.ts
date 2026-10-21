import {
  correlationMiddleware,
  requestLoggingMiddleware,
  createServiceLogger,
} from "@dps/logger";
import { serverConfig } from "./index.js";

export const logger = createServiceLogger(
  serverConfig.APP_NAME,
  serverConfig.LOG_LEVEL,
);

export const requestLogger = requestLoggingMiddleware(logger);

export const correlationIdMiddleware = correlationMiddleware;
