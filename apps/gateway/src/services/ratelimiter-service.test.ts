import type { RedisClientType } from "@redis/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimiterService } from "./ratelimiter-service.js";

describe("RateLimiterService", () => {
  const mockExec = vi.fn();
  const mockMulti = {
    zRemRangeByScore: vi.fn().mockReturnThis(),
    zAdd: vi.fn().mockReturnThis(),
    zCard: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    exec: mockExec,
  };

  const mockClient = {
    multi: vi.fn(() => mockMulti),
  } as unknown as RedisClientType;

  const service = new RateLimiterService(mockClient);
  const FIXED_DATE = new Date("2024-01-01T00:00:00Z");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should correctly record requests and return count", async () => {
    const key = "user:123";
    const window = 60;
    const expectedCount = 5;

    mockExec.mockResolvedValue([undefined, undefined, expectedCount]);

    const result = await service.checklimit(key, window, "FIXED_WINDOW");
    expect(result.currentCount).toBe(expectedCount);

    expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
      key,
      0,
      FIXED_DATE.getTime() - window * 1000,
    );

    expect(mockMulti.zAdd).toHaveBeenCalledWith(key, {
      score: FIXED_DATE.getTime(),
      value: expect.stringMatching(
        new RegExp(`^${FIXED_DATE.getTime()}-\\d+\\.\\d+`),
      ),
    });

    expect(mockMulti.expire).toHaveBeenCalledWith(key, window + 1);
    expect(mockExec).toHaveBeenCalled();
  });
});
