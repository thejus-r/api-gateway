import type { NextFunction, Request, Response } from "express";
import { client } from "../config/redis.js";

const TIER_LIMITS: Record<string, number> = {
  basic: 10,
  premium: 100,
};

const WINDOW_SIZE_IN_SECONDS = 60;

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { apiKey, tier } = req.user;

    const limit = TIER_LIMITS[tier] || 10;
    const currentTime = Date.now();

    const windowStart = currentTime - WINDOW_SIZE_IN_SECONDS * 1000;
    const key = `rate_limit:${apiKey}`;

    const multi = client.multi();
    multi.zRemRangeByScore(key, 0, windowStart);

    const uniqueRequest = `${currentTime}-${Math.random()}`;
    multi.zAdd(key, { score: currentTime, value: uniqueRequest });

    multi.zCard(key);

    multi.expire(key, WINDOW_SIZE_IN_SECONDS + 1);

    const results = await multi.exec();

    const requestCount = results[2] as unknown as number;

    res.set("X-RateLimit-Limit", limit.toString());
    res.set(
      "X-RateLimit-Remaining",
      Math.max(0, limit - requestCount).toString(),
    );

    if (requestCount > limit) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Limit of ${limit} exceeded for ${tier} tier.`,
        retryAfter: WINDOW_SIZE_IN_SECONDS,
      });
    }
    next();
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    next(error);
  }
};
