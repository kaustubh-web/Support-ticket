import "dotenv/config";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const app = createApp();

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

export default app;
