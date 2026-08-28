import type { Request } from "express";
import { AppError } from "../errors/app-error.js";

/**
 * Reads a single required route parameter. Express 5 types route params as
 * `string | string[] | undefined`; this narrows to a plain string and fails
 * loudly if the segment is missing or repeated.
 */
export function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(`Missing route parameter: ${name}`, 400);
  }
  return value;
}
