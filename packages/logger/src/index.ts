import type { RequestHandler } from "express";
import {
  createLogger as createWinstonLogger,
  format,
  transports,
  type Logger,
} from "winston";
import { getCorrelationId } from "./correlation.js";
// import { correlationIdFormat } from "./correlation.js";

export const correlationIdFormat = format((info) => {
  const id = getCorrelationId();
  if (id) info.correlationId = id;
  return info;
});

export function createServiceLogger(service: string, logLevel: string): Logger {
  const serviceName = service.trim();

  if (!serviceName) {
    throw new Error("A service name is required to create a logger.");
  }

  return createWinstonLogger({
    level: logLevel ?? "info",
    defaultMeta: { service: serviceName },
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      correlationIdFormat(),
      format.printf(
        ({
          timestamp,
          level,
          service,
          correlationId,
          message,
          stack,
          ...meta
        }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          const cid = correlationId ? ` [${correlationId}]` : "";
          return `[${timestamp}] [${level}] [${service}]${cid}: ${message}${metaStr}${stack ? `\n${stack}` : ""}`;
        },
      ),
    ),
    transports: [new transports.Console()],
  });
}

export function requestLoggingMiddleware(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const level =
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "info";

      logger.log(level, "HTTP request completed", {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      });
    });

    next();
  };
}

export type { Logger };
export {
  correlationMiddleware,
  getCorrelationId,
  runWithCorrelationId,
  CORRELATION_HEADER,
} from "./correlation.js";
