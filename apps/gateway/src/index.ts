import { connectDB } from "@repo/database";
import express, { type Request, type Response } from "express";
import { createProxyMiddleware, type Options } from "http-proxy-middleware";
import { connectRedis } from "./config/redis";

import { authMiddleware } from "./middleware/auth-middleware";
import { register, trackMetrics } from "./middleware/metrics";
import { rateLimiter } from "./middleware/rate-limiter";

const app = express();

// Initialize infrastructure
const MONGO_URI = process.env.MONGO_URI || "";
connectDB(MONGO_URI);
connectRedis();

app.get("/metrics", async (_: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(trackMetrics);

const proxyOptions: Options = {
  target: process.env.TARGET_API_URL,
  changeOrigin: true,
  pathRewrite: { "^/api": "" },
};

app.use(
  "/api",
  authMiddleware,
  rateLimiter,
  createProxyMiddleware(proxyOptions),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Gateway running on port ${PORT}`));
