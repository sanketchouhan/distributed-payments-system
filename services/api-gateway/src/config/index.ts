import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
  PORT: number;
  LOG_LEVEL: string;
  REDIS_URL: string;
  USER_MANAGEMENT_SERVICE_URL: string;
  WALLET_SERVICE_URL: string;
  DEFAULT_TIMEOUT: number;
};

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  USER_MANAGEMENT_SERVICE_URL: process.env.USER_MANAGEMENT_SERVICE_URL || "",
  WALLET_SERVICE_URL: process.env.WALLET_SERVICE_URL || "",
  DEFAULT_TIMEOUT: Number(process.env.DEFAULT_TIMEOUT || "30000"),
};
