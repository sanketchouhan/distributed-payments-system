import { createServiceLogger } from "@dps/logger";
import { serverConfig } from "./index.js";

export const logger = createServiceLogger(
  "api-gateway",
  serverConfig.LOG_LEVEL,
);
