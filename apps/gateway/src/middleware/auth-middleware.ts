import { User } from "@repo/database";
import type { NextFunction, Request, Response } from "express";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ error: "Missing x-api-key header" });
  }

  try {
    const user = await User.findOne({ apiKey }).lean();

    if (!user) {
      return res.status(401).json({ error: "Invalid API Key" });
    }

    req.user = {
      username: user.username,
      tier: user.tier,
      apiKey: user.apiKey,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
