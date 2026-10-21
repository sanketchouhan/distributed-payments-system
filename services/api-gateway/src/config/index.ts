import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
  APP_NAME: string;
  PORT: number;
  LOG_LEVEL: string;
  JWT_SECRET: string;
  REDIS_URL: string;
  USER_MANAGEMENT_SERVICE_URL: string;
  WALLET_SERVICE_URL: string;
  DEFAULT_TIMEOUT: number;
};

export const serverConfig: ServerConfig = {
  APP_NAME: process.env.APP_NAME || "api-gateway",
  PORT: Number(process.env.PORT) || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  JWT_SECRET: process.env.JWT_SECRET || "my-jwt-secret",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  USER_MANAGEMENT_SERVICE_URL: process.env.USER_MANAGEMENT_SERVICE_URL || "",
  WALLET_SERVICE_URL: process.env.WALLET_SERVICE_URL || "",
  DEFAULT_TIMEOUT: Number(process.env.DEFAULT_TIMEOUT || "30000"),
};
