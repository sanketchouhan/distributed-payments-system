import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
  PORT: number;
};

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3000,
};
