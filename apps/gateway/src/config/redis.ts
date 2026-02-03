import { createClient, type RedisClientType } from "@redis/client";

const client: RedisClientType = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
});

client.on("error", (err) => console.log("redis client error", err));

const connectRedis = async (): Promise<void> => {
  await client.connect();
  console.log("redis connected");
};

export { client, connectRedis };
