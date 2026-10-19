import { createApp } from "./app.js";
import { serverConfig } from "./config/index.js";
import { logger } from "./config/logger.config.js";

const app = createApp();

app.listen(serverConfig.PORT, () => {
  logger.info(`Server started at port: ${serverConfig.PORT}`);
});
