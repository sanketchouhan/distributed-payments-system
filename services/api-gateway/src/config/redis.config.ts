import { readFileSync } from "node:fs";
import { Redis } from "ioredis";
import { logger } from "./logger.config.js";
import { serverConfig } from "./index.js";

declare module "ioredis" {
  interface Redis {
    evaluateRateLimit(
      key: string,
      capacity: number,
      refillRate: number,
      cost: number,
    ): Promise<[number, number, number]>;
  }
}

const rateLimitScript = readFileSync(
  new URL("../scripts/rateLimiter.lua", import.meta.url),
  "utf8",
);

class RedisClient {
  private static instance: Redis;
  private static isConnected = false;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(serverConfig.REDIS_URL, {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      RedisClient.instance.defineCommand("evaluateRateLimit", {
        numberOfKeys: 1,
        lua: rateLimitScript,
      });

      RedisClient.setupEventListeners();
    }
    return RedisClient.instance;
  }

  private static setupEventListeners(): void {
    RedisClient.instance.on("connect", () => {
      RedisClient.isConnected = true;
      logger.info("Connected to Redis");
    });

    RedisClient.instance.on("error", (error) => {
      RedisClient.isConnected = false;
      logger.error("Redis connection error:", error);
    });

    RedisClient.instance.on("close", () => {
      RedisClient.isConnected = false;
      logger.warn("Redis connection closed");
    });

    RedisClient.instance.on("reconnecting", () => {
      logger.info("Reconnecting to Redis...");
    });
  }

  public static isReady(): boolean {
    return RedisClient.isConnected;
  }

  public static async closeConnection() {
    if (RedisClient.instance) {
      try {
        await RedisClient.instance.quit();
        logger.info("Redis connection closed");
      } catch (error) {
        logger.error("Error closing Redis connection:", error);
      }
    }
  }
}

export default RedisClient.getInstance();
