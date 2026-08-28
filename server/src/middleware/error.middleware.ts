import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { AppError } from "../shared/errors/app-error.js";

interface HttpishError extends Error {
  status?: number;
  statusCode?: number;
}

function resolveStatusCode(err: HttpishError): number {
  if (err instanceof ZodError) return 400;
  if (err instanceof AppError) return err.statusCode;
  return err.statusCode ?? err.status ?? 500;
}

export function errorHandler(
  err: HttpishError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = resolveStatusCode(err);
  const message =
    err instanceof ZodError
      ? "Invalid request data"
      : statusCode >= 500
        ? "Internal Server Error"
        : err.message;

  const log = statusCode >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger);
  log({ err, path: req.originalUrl, method: req.method }, err.message || "Request failed");

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof ZodError
      ? { issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }
      : {}),
  });
}
