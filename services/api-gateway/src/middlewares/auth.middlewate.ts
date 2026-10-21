import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { serverConfig } from "../config/index.js";
import { logger } from "../config/logger.config.js";
import redis from "../config/redis.config.js";

const publicRoutes = [
  "/",
  "/health",
  "/api/v1/users/login",
  "/api/v1/users/register",
];

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const requestMeta = {
    requestId: req.get("x-request-id"),
    method: req.method,
    path: req.originalUrl,
  };
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    logger.warn("Authentication rejected: missing bearer token", requestMeta);
    return res.status(403).send({ message: "invalid authorization header" });
  }

  jwt.verify(token, serverConfig.JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      logger.warn("Authentication rejected: invalid token", {
        ...requestMeta,
        reason: err.name,
      });
      return res.status(401).send({ message: "unauthorized" });
    }

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "string"
    ) {
      logger.warn("Authentication rejected: invalid token claims", requestMeta);
      return res.status(401).send({ message: "unauthorized" });
    }

    const redisKey = `auth:${decoded.id}:${token}`;
    let redisToken: string | null;

    try {
      redisToken = await redis.get(redisKey);
    } catch (error) {
      logger.error("Authentication session lookup failed", {
        ...requestMeta,
        userId: decoded.id,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return res
        .status(503)
        .json({ message: "authentication service unavailable" });
    }

    if (!redisToken) {
      logger.warn("Authentication rejected: session not found or revoked", {
        ...requestMeta,
        userId: decoded.id,
      });
      return res.status(401).json({ message: "unauthorized" });
    }

    req.userId = decoded.id;
    req.token = token;

    return next();
  });
};
