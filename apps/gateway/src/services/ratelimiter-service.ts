import type { RedisClientType } from "@redis/client";

export interface IRateLimiterService {
  checklimit: (
    key: string,
    windowSize: number,
  ) => Promise<{
    currentCount: number;
  }>;
}

export class RateLimiterService implements IRateLimiterService {
  private readonly client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  checklimit = async (key: string, windowSize: number) => {
    const currentTime = Date.now();

    const multi = this.client.multi();

    const windowStart = currentTime - windowSize * 1000;
    multi.zRemRangeByScore(key, 0, windowStart);

    const uniqueRequest = `${currentTime}-${Math.random()}`;
    multi.zAdd(key, { score: currentTime, value: uniqueRequest });

    multi.zCard(key);

    multi.expire(key, windowSize + 1);

    const results = await multi.exec();

    const requestCount = results[2] as unknown as number;

    return {
      currentCount: requestCount,
    };
  };
}
