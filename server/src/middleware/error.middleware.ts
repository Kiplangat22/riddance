import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

interface AppError extends Error {
  statusCode?: number;
  status?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message = statusCode >= 500 ? "Internal Server Error" : err.message;

  logger.error(
    { err, path: req.originalUrl, method: req.method },
    err.message || "Unhandled error",
  );

  res.status(statusCode).json({
    success: false,
    message,
  });
}
