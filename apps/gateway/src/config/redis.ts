import { createClient, type RedisClientType } from "@redis/client";

const client: RedisClientType = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:6379`,
});

client.on("error", (err) => console.log("redis client error", err));

const connectRedis = async (): Promise<void> => {
  await client.connect();
  console.log("redis connected");
};

export { client, connectRedis };
