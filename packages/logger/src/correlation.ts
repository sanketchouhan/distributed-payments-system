import type { RequestHandler } from "express";
import { AsyncLocalStorage } from "node:async_hooks";
import { v4 as uuidv4, validate as isUuid } from "uuid";

export const CORRELATION_HEADER = "x-correlation-id";

const storage = new AsyncLocalStorage<{ correlationId: string }>();

export const runWithCorrelationId = <T>(
  correlationId: string,
  fn: () => T,
): T => storage.run({ correlationId }, fn);

export const getCorrelationId = (): string | undefined =>
  storage.getStore()?.correlationId;

export function correlationMiddleware(): RequestHandler {
  return (req, res, next) => {
    const incoming = req.headers[CORRELATION_HEADER];
    const id =
      typeof incoming === "string" && isUuid(incoming) ? incoming : uuidv4();

    req.headers[CORRELATION_HEADER] = id; // forwarded by the proxy
    res.setHeader("X-Correlation-Id", id); // returned to the client

    runWithCorrelationId(id, next);
  };
}
