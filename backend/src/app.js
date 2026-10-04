import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ticketsRouter from "./routes/tickets.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

let isConnected = false;
async function connectDb() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/support_tickets";
  await mongoose.connect(URI);
  isConnected = true;
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  // Ensure DB connection before routes
  app.use(async (_req, _res, next) => {
    try {
      await connectDb();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/tickets", ticketsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
