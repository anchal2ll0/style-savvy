import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import wardrobeRoutes from "./routes/wardrobe.js";
import savedRoutes from "./routes/saved.js";
import grokRoutes from "./routes/grok.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: false,
  }),
);
app.use(express.json({ limit: "15mb" })); // image data URLs for Grok

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/grok", grokRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
});
