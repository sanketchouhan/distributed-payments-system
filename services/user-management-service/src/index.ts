import { createApp } from "./app.js";
import { serverConfig } from "./config/index.js";

const app = createApp();

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running on port ${serverConfig.PORT}`);
});
