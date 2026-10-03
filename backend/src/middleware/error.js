import { ZodError } from "zod";
import mongoose from "mongoose";

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Consistent error shape: { error: { message, details? } } */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const details = {};
    for (const i of err.issues) details[i.path[0] ?? "body"] ??= i.message;
    return res.status(400).json({ error: { message: "Validation failed", details } });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ error: { message: "Ticket not found" } });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  console.error(err);
  res.status(500).json({ error: { message: "Internal server error" } });
}

export const notFoundHandler = (_req, res) => res.status(404).json({ error: { message: "Route not found" } });
