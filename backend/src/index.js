import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/support_tickets";

await mongoose.connect(URI);
console.log("Connected to MongoDB successfully");

const app = createApp();

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

export default app;
