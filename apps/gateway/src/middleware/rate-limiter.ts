import type { NextFunction, Request, Response } from "express";
import type { IRateLimiterService } from "../services/ratelimiter-service.js";

const TIER_LIMITS: Record<string, number> = {
  basic: 10,
  premium: 100,
};

const WINDOW_SIZE_IN_SECONDS = 60;

// Creates a ratelimiter instance, with dependency injection
export const createRateLimiter = (rateLimiterService: IRateLimiterService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { apiKey, tier } = req.user;

      const limit = TIER_LIMITS[tier] || 10;
      const key = `rate_limit:${apiKey}`;
      const { currentCount } = await rateLimiterService.checklimit(
        key,
        WINDOW_SIZE_IN_SECONDS,
      );

      res.set("X-RateLimit-Limit", limit.toString());
      res.set(
        "X-RateLimit-Remaining",
        Math.max(0, limit - currentCount).toString(),
      );

      // Limit crossed
      if (currentCount > limit) {
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
};
