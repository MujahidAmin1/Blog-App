import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appErrors"
import { z } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
  // ▲
  // all four parameters are required — even if you don't use next
  // if you remove next, Express won't recognize this as an error handler
) {
  // ── Case 1: AppError — an error we deliberately threw ─────────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // ── Case 2: Mongoose CastError — invalid MongoDB ObjectId ─────────────────
  // happens when someone sends /api/blogs/not-a-valid-id
  // Mongoose throws a CastError trying to convert "not-a-valid-id" to ObjectId
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as any).name === "CastError"
  ) {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  // ── Case 3: Mongoose duplicate key error ───────────────────────────────────
  // happens when you try to register with an email that already exists
  // MongoDB throws error code 11000 for unique constraint violations
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as any).code === 11000
  ) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? "field";
    // ▲
    // keyValue is a MongoDB property that tells you which field caused
    // the duplicate — e.g. { email: "m@email.com" }
    // Object.keys() gets ["email"], [0] gets "email"
    return res.status(400).json({
      message: `${field} already exists`,
      // → "email already exists"
    });
  }

  // ── Case 4: JWT errors ─────────────────────────────────────────────────────
  if (typeof err === "object" && err !== null && "name" in err) {
    const name = (err as any).name;
    if (name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
  }

  // ── Case 5: Zod validation error (if you ever use parse instead of safeParse)
  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // ── Case 6: Unknown/unexpected error ──────────────────────────────────────
  // This is a bug — something crashed that shouldn't have
  // Log it so you can investigate, but don't expose internals to the client
  console.error("Unexpected error:", err);

  return res.status(500).json({
    message: "Something went wrong",
  });
}

export default errorHandler;