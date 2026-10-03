import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/support_tickets";

let isConnecting = false;
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  if (!isConnecting) {
    isConnecting = true;
    try {
      await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB successfully");
    } catch (err) {
      console.error("MongoDB connection error:", err.message);
    } finally {
      isConnecting = false;
    }
  }
}

const app = createApp();

// Connect to DB on incoming requests without freezing startup
app.use(async (_req, _res, next) => {
  await ensureDb();
  next();
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

export default app;
