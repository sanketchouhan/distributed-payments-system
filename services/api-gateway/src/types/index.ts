import { NextFunction, Request, Response } from "express";

export interface ServiceConfig {
  path: string;
  url: string;
  pathRewrite: Record<string, string>;
  name: string;
  timeout?: number;
  rateLimit?: RateLimitConfig;
}

export interface ProxyErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}

export interface RateLimitConfig {
  capacity: number;
  refillRate: number; // tokens per second
}

export const AUTH_LIMIT: RateLimitConfig = {
  capacity: 20,
  refillRate: 20 / 60,
};
export const DEFAULT_LIMIT: RateLimitConfig = {
  capacity: 100,
  refillRate: 100 / 60,
};
