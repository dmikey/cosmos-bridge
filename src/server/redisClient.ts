import redis from "redis";

export const redisClient = redis.createClient({
  host: "0.0.0.0",
});
