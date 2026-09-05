import Redis from "ioredis";
import { env } from "../config/env";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });

    redisClient.on("error", (err) => {
      console.error("[Redis Client Error]:", err.message);
    });
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit().catch(() => {});
    redisClient = null;
  }
}
