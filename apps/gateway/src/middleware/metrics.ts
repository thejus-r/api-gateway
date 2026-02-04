import type { NextFunction, Request, Response } from "express";
import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status", "tier"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestDuration);

export const trackMetrics = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;

    const tier = req.user?.tier || "anonymous";

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.path,
        status: res.statusCode,
        tier: tier,
      },
      duration,
    );
  });

  next();
};
