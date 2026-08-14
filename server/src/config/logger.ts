import pino from "pino";
import { env } from "./env.js";

const loggerOptions: pino.LoggerOptions = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
};

if (env.NODE_ENV === "development") {
  loggerOptions.transport = { target: "pino-pretty", options: { colorize: true } };
}

export const logger = pino(loggerOptions);
