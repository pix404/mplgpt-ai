import { createClient, RedisClientType } from "redis";

class RedisSingleton {
  private static instance: RedisClientType | null = null;

  private constructor() {}

  public static async getInstance(): Promise<RedisClientType> {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = createClient({
        url: process.env.REDIS_URL,
      });

      await RedisSingleton.instance.connect();

      RedisSingleton.instance.on("error", (err) =>
        console.error("Redis Client Error", err),
      );
    }

    return RedisSingleton.instance;
  }
}

export default RedisSingleton;
