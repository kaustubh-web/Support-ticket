import express from "express";
import cors from "cors";
import ticketsRouter from "./routes/tickets.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
  app.use(express.json({ limit: "100kb" }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/tickets", ticketsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
