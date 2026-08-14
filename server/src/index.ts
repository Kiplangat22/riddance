import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "RIDDANCE API running");
});

function shutdown(signal: string): void {
  logger.info({ signal }, "Shutting down RIDDANCE API");
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Error while closing server");
      process.exitCode = 1;
    }
    process.exit();
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
