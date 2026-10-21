import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import { DBConfig } from "../config/index.js";

export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  host: DBConfig.host,
  port: DBConfig.port,
  database: DBConfig.database,
  user: DBConfig.user,
  password: DBConfig.password,
  logging: DBConfig.logging ? console.log : false,
});