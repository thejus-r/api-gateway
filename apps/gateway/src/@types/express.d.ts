declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        apiKey: string;
        tier: "basic" | "premium";
      };
    }
  }
}

export {};
