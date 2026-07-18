import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;

  logger.error(
    { err, path: req.originalUrl, method: req.method },
    err.message,
  );

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}