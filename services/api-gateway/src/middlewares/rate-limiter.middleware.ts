import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.config.js";
import redis from "../config/redis.config.js";

export function rateLimitMiddleware(
  capacity: number,
  refillRate: number,
  keyPrefix: string,
  shouldSkip?: (request: Request) => boolean,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/api/v1/health") || shouldSkip?.(req)) {
      return next();
    }

    const identifier = req.ip ?? req.socket.remoteAddress ?? "anonymous";
    const redisKey = `ratelimit:token-bucket:v1:${keyPrefix}:${identifier}`;

    try {
      const [isAllowed, remainingTokens, retryAfterMs] =
        await redis.evaluateRateLimit(redisKey, capacity, refillRate, 1);

      res.setHeader("RateLimit-Limit", String(capacity));
      res.setHeader("RateLimit-Remaining", String(remainingTokens));

      if (isAllowed === 1) {
        return next();
      }

      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: retryAfterSeconds,
      });
    } catch (error) {
      logger.error("Rate limiting failed", { error });
      return next();
    }
  };
}
