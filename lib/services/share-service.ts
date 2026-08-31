import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongodb";
import { redis, isRedisConfigured } from "@/lib/db/redis";
import { SharedContext, ISharedContextMetadata } from "@/lib/models/SharedContext";

export interface CreateShareInput {
  title: string;
  markdown: string;
  metadata?: Partial<ISharedContextMetadata>;
  ttlSeconds: number; // Duration in seconds
  parentToken?: string | null;
}

export interface SharedContextPayload {
  shareToken: string;
  title: string;
  markdown: string;
  metadata: ISharedContextMetadata;
  parentToken: string | null;
  version: number;
  expiresAt: string; // ISO string
  createdAt: string; // ISO string
  isExpired: boolean;
}

// Generate cryptographically secure, URL-safe 192-bit token
export function generateShareToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

// Allowed TTL limits: Minimum 1 minute (60s), Maximum 30 days (2,592,000s)
export const MIN_TTL_SECONDS = 60;
export const MAX_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function createSharedContext(input: CreateShareInput): Promise<{ shareToken: string; expiresAt: Date; shareUrl: string }> {
  const { title, markdown, metadata, parentToken } = input;

  // Sanitize and constrain TTL
  const ttlSeconds = Math.max(MIN_TTL_SECONDS, Math.min(input.ttlSeconds, MAX_TTL_SECONDS));

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const shareToken = generateShareToken();

  const formattedMetadata: ISharedContextMetadata = {
    wordCount: metadata?.wordCount || 0,
    charCount: metadata?.charCount || 0,
    lineCount: metadata?.lineCount || 0,
    readTimeMinutes: metadata?.readTimeMinutes || 1,
    theme: metadata?.theme || "dark",
  };

  const payload: SharedContextPayload = {
    shareToken,
    title: title || "Untitled.md",
    markdown,
    metadata: formattedMetadata,
    parentToken: parentToken || null,
    version: 1,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    isExpired: false,
  };

  let savedToMongo = false;

  // 1. Primary Persistent Store: MongoDB (if MONGODB_URI is configured)
  try {
    const mongo = await connectToDatabase();
    if (mongo) {
      await SharedContext.create({
        shareToken,
        title: payload.title,
        markdown: payload.markdown,
        metadata: payload.metadata,
        parentToken: payload.parentToken,
        version: 1,
        expiresAt,
        isRevoked: false,
        viewCount: 0,
      });
      savedToMongo = true;
    }
  } catch (err) {
    console.error("Failed to persist shared context to MongoDB:", err);
  }

  // 2. L1 Cache / Local Store: Redis or In-Memory fallback
  // If Redis is configured, write as L1 cache; if Mongo was not available, save in memory/Redis
  try {
    const redisKey = `share:${shareToken}`;
    await redis.set(redisKey, JSON.stringify(payload), "EX", ttlSeconds);
  } catch (err) {
    if (!savedToMongo) {
      console.warn("Failed to write to fallback store:", err);
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}`
    : "https://preview-md.vercel.app");

  return {
    shareToken,
    expiresAt,
    shareUrl: `${siteUrl}/s/${shareToken}`,
  };
}

export async function getSharedContext(token: string): Promise<SharedContextPayload | null> {
  if (!token || typeof token !== "string" || token.length < 8) {
    return null;
  }

  const redisKey = `share:${token}`;

  // 1. If Redis is configured, check Redis L1 Cache first for sub-millisecond read
  if (isRedisConfigured()) {
    try {
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData) as SharedContextPayload;
        if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
          await redis.del(redisKey);
          return null;
        }
        return parsed;
      }
    } catch {
      // ignore redis read failure and proceed to Mongo
    }
  }

  // 2. Query MongoDB (Standard Mode with MONGODB_URI)
  try {
    const mongo = await connectToDatabase();
    if (mongo) {
      const doc = await SharedContext.findOne({
        shareToken: token,
        expiresAt: { $gt: new Date() },
        isRevoked: false,
      }).lean();

      if (doc) {
        const remainingSeconds = Math.max(1, Math.floor((new Date(doc.expiresAt).getTime() - Date.now()) / 1000));

        const payload: SharedContextPayload = {
          shareToken: doc.shareToken,
          title: doc.title,
          markdown: doc.markdown,
          metadata: doc.metadata,
          parentToken: doc.parentToken || null,
          version: doc.version || 1,
          expiresAt: new Date(doc.expiresAt).toISOString(),
          createdAt: new Date(doc.createdAt).toISOString(),
          isExpired: false,
        };

        // If Redis is active, backfill cache with remaining TTL
        if (isRedisConfigured()) {
          redis.set(redisKey, JSON.stringify(payload), "EX", remainingSeconds).catch(() => {});
        }

        // Increment view count asynchronously
        SharedContext.updateOne({ shareToken: token }, { $inc: { viewCount: 1 } }).catch(() => {});

        return payload;
      }
      return null;
    }
  } catch (err) {
    console.error("MongoDB fetch error for share token:", err);
  }

  // 3. In-Memory fallback (when neither Redis nor MongoDB is connected, e.g. local offline dev)
  try {
    const memoryData = await redis.get(redisKey);
    if (memoryData) {
      const parsed = JSON.parse(memoryData) as SharedContextPayload;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        await redis.del(redisKey);
        return null;
      }
      return parsed;
    }
  } catch {
    // ignore
  }

  return null;
}

export async function checkRateLimit(
  ip: string,
  action: "create" | "view",
  limit: number = 20,
  windowSeconds: number = 60,
): Promise<{ success: boolean; remaining: number }> {
  try {
    const key = `ratelimit:${action}:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const remaining = Math.max(0, limit - count);
    return {
      success: count <= limit,
      remaining,
    };
  } catch {
    return { success: true, remaining: limit };
  }
}
