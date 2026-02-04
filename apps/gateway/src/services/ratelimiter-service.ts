import type { RedisClientType } from "@redis/client";

export const RateLimitStrategy = {
  FIXED_WINDOW: "FIXED_WINDOW",
  SLIDING_WINDOW_LOG: "SLIDING_WINDOW_LOG",
} as const;

export type RateLimitStrategy =
  (typeof RateLimitStrategy)[keyof typeof RateLimitStrategy];

export interface IRateLimiterService {
  checklimit: (
    key: string,
    windowSize: number,
    strategy: RateLimitStrategy,
  ) => Promise<{
    currentCount: number;
  }>;
}

export class RateLimiterService implements IRateLimiterService {
  private readonly client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  checklimit = async (
    key: string,
    windowSize: number,
    strategy: RateLimitStrategy,
  ) => {
    if (strategy === RateLimitStrategy.FIXED_WINDOW) {
      return this.checkFixedWindow(key, windowSize);
    }

    return this.checkSlidingWindow(key, windowSize);
  };

  private checkSlidingWindow = async (key: string, windowSize: number) => {
    const currentTime = Date.now();
    const windowStart = currentTime - windowSize * 1000;

    const multi = this.client.multi();

    multi.zRemRangeByScore(key, 0, windowStart);

    const uniqueRequest = `${currentTime}-${Math.random()}`;
    multi.zAdd(key, { score: currentTime, value: uniqueRequest });

    multi.zCard(key);

    multi.expire(key, windowSize + 1);

    const results = await multi.exec();

    if (!results) throw new Error("Redis transaction failed");

    const requestCount = results[2] as unknown as number;

    return {
      currentCount: requestCount,
    };
  };

  private checkFixedWindow = async (key: string, windowSize: number) => {
    const currentTimeSeconds = Math.floor(Date.now() / 1000);

    const windowIndex = Math.floor(currentTimeSeconds / windowSize);
    const windowKey = `${key}:${windowIndex}`;

    const multi = this.client.multi();

    multi.incr(windowKey);
    multi.expire(windowKey, windowSize * 2);

    const results = await multi.exec();
    if (!results) throw new Error("Redis transaction failed");

    const requestCount = results[0] as unknown as number;

    return {
      currentCount: requestCount,
    };
  };
}
