import { createApp } from "./app.js";
import { serverConfig } from "./config/index.js";
import { logger } from "./config/logger.config.js";
import { sequelize } from "./db/index.js";

const app = createApp();

async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connection authenticated.");

    app.listen(serverConfig.PORT, () => {
      logger.info(
        `User management service listening on port ${serverConfig.PORT}`,
      );
    });
  } catch (error) {
    logger.error("Unable to connect to PostgreSQL:", error);
    await sequelize.close().catch(() => undefined);
    process.exitCode = 1;
  }
}

void startServer();
