import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
  APP_NAME: string;
  PORT: number;
  LOG_LEVEL: string;
  JWT_SECRET: string;
  REDIS_URL: string;
};

type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  logging: boolean;
};

export const serverConfig: ServerConfig = {
  APP_NAME: process.env.APP_NAME || "user-management-service",
  PORT: Number(process.env.PORT) || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  JWT_SECRET: process.env.JWT_SECRET || "my-jwt-secret",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};

export const DBConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "postgres_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  logging: process.env.DB_LOGGING === "true",
};
