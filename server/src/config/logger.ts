import pino from "pino";
import { env } from "./env.js";

const levelByEnv: Record<typeof env.NODE_ENV, pino.LevelWithSilent> = {
  production: "info",
  development: "debug",
  test: "silent",
};

const loggerOptions: pino.LoggerOptions = {
  level: levelByEnv[env.NODE_ENV],
};

if (env.NODE_ENV === "development") {
  loggerOptions.transport = { target: "pino-pretty", options: { colorize: true } };
}

export const logger = pino(loggerOptions);
