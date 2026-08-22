import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";

export function errorHandler(
  err: Error & { status?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof ZodError ? 400 : err instanceof AppError ? err.statusCode : err.status ?? 500;
  const message = err instanceof ZodError ? "Invalid request data" : statusCode >= 500 ? "Internal Server Error" : err.message;

  logger.error(
    { err, path: req.originalUrl, method: req.method },
    err.message || "Unhandled error",
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof ZodError ? { issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) } : {}),
  });
}
