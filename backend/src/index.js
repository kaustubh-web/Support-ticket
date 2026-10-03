import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/support_tickets";

if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(URI);
}

const app = createApp();


if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

export default app;
