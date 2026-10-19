import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "../config/logger.config.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const requestId = (req.headers["x-request-id"] as string) ?? randomUUID();

  // Make the id available downstream and to the client
  req.headers["x-request-id"] = requestId; // forwarded to proxied services
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

    const meta = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs),
    };

    if (res.statusCode >= 500) logger.error("request completed", meta);
    else if (res.statusCode >= 400) logger.warn("request completed", meta);
    else logger.info("request completed", meta);
  });

  // Client disconnected before a response was sent
  res.on("close", () => {
    if (!res.writableFinished) {
      logger.warn("request aborted", {
        requestId,
        method: req.method,
        url: req.originalUrl,
      });
    }
  });

  next();
}
