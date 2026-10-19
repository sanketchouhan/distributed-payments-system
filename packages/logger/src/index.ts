import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import {
  createLogger as createWinstonLogger,
  format,
  transports,
  type Logger,
} from "winston";

const correlationIdContext = new AsyncLocalStorage<string>();

const correlationIdFormat = format((info) => {
  const correlationId = correlationIdContext.getStore();

  if (correlationId && info.correlationId === undefined) {
    info.correlationId = correlationId;
  }

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
        ({ timestamp, level, service, message, stack, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          const stackString = stack ? `\n${stack}` : "";
          return `[${timestamp}] [${level}] [${service}]: ${message}${metaString}${stackString}`;
        },
      ),
    ),
    transports: [new transports.Console()],
  });
}

export const correlationIdMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  const incomingId = request.get("x-correlation-id");
  const correlationId =
    incomingId && /^[A-Za-z0-9._:-]{1,128}$/.test(incomingId)
      ? incomingId
      : randomUUID();

  response.setHeader("x-correlation-id", correlationId);
  correlationIdContext.run(correlationId, next);
};

export function requestLoggingMiddleware(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const startedAt = process.hrtime.bigint();

    response.on("finish", () => {
      const durationMs = Number(
        (Number(process.hrtime.bigint() - startedAt) / 1_000_000).toFixed(2),
      );
      const level =
        response.statusCode >= 500
          ? "error"
          : response.statusCode >= 400
            ? "warn"
            : "info";

      logger.log(level, "HTTP request completed", {
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        durationMs,
      });
    });

    next();
  };
}
