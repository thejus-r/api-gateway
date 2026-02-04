import { connectDB } from "@repo/database";
import express, { type Request, type Response } from "express";
import { createProxyServer, type ServerOptions } from "http-proxy-3";
import { connectRedis } from "./config/redis.js";

import { authMiddleware } from "./middleware/auth-middleware.js";
import { register, trackMetrics } from "./middleware/metrics.js";
import { rateLimiter } from "./middleware/rate-limiter.js";

const app = express();

// Initialize infrastructure
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://root:example@localhost:27017";
connectDB(MONGO_URI);
connectRedis();

app.use(trackMetrics);

app.get("/metrics", async (_: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const proxyOptions: ServerOptions = {
  target: process.env.API_URL || "http://localhost:3001",
  changeOrigin: true,
};

const proxy = createProxyServer(proxyOptions);

app.use("/api", authMiddleware, rateLimiter, proxy.web);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Gateway running on port ${PORT}`));
