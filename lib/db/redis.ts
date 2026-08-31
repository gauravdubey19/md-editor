import Redis from "ioredis";

interface MemoryCacheItem {
  value: string;
  expiresAt: number;
}

const globalForStore = globalThis as unknown as {
  __IN_MEMORY_REDIS_STORE__?: Map<string, MemoryCacheItem>;
};

if (!globalForStore.__IN_MEMORY_REDIS_STORE__) {
  globalForStore.__IN_MEMORY_REDIS_STORE__ = new Map<string, MemoryCacheItem>();
}

class InMemoryRedisFallback {
  private get store(): Map<string, MemoryCacheItem> {
    return globalForStore.__IN_MEMORY_REDIS_STORE__!;
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<"OK"> {
    let expiresAt = Infinity;
    if (mode === "EX" && typeof duration === "number") {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === "PX" && typeof duration === "number") {
      expiresAt = Date.now() + duration;
    }
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const num = current ? parseInt(current, 10) + 1 : 1;
    const item = this.store.get(key);
    const expiresAt = item ? item.expiresAt : Date.now() + 60 * 1000;
    this.store.set(key, { value: num.toString(), expiresAt });
    return num;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ping(): Promise<string> {
    return "PONG (In-Memory)";
  }
}

export type RedisClientType = Redis | InMemoryRedisFallback;

const globalForRedis = globalThis as unknown as {
  redisClient: RedisClientType | undefined;
};

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0);
}

function getRedisClient(): RedisClientType {
  if (globalForRedis.redisClient) {
    return globalForRedis.redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl && redisUrl.trim().length > 0) {
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        connectTimeout: 4000,
        lazyConnect: false,
        enableOfflineQueue: false,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 100, 1000);
        },
      });

      client.on("error", (err) => {
        console.warn("Redis connection warning:", err.message);
      });

      globalForRedis.redisClient = client;
      return client;
    } catch {
      const fallback = new InMemoryRedisFallback();
      globalForRedis.redisClient = fallback;
      return fallback;
    }
  }

  const fallback = new InMemoryRedisFallback();
  globalForRedis.redisClient = fallback;
  return fallback;
}

export const redis = getRedisClient();
