import { prisma } from "./prisma";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();

  try {
    // Try to find existing rate limit record
    const existing = await prisma.rateLimit.findUnique({
      where: { key: identifier },
    });

    if (existing) {
      const windowEnd = new Date(
        existing.windowStart.getTime() + config.windowMs
      );

      if (windowEnd > now) {
        // Window still active - increment
        const updated = await prisma.rateLimit.update({
          where: { key: identifier },
          data: { count: { increment: 1 } },
        });

        const remaining = Math.max(0, config.maxRequests - updated.count);
        return {
          success: updated.count <= config.maxRequests,
          remaining,
          resetAt: windowEnd,
        };
      } else {
        // Window expired - reset
        await prisma.rateLimit.update({
          where: { key: identifier },
          data: { count: 1, windowStart: now },
        });

        return {
          success: true,
          remaining: config.maxRequests - 1,
          resetAt: new Date(now.getTime() + config.windowMs),
        };
      }
    } else {
      // New entry
      await prisma.rateLimit.create({
        data: { key: identifier, count: 1, windowStart: now },
      });

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      };
    }
  } catch (error) {
    // Fail open - if DB is down, allow the request
    console.warn(
      "Rate limit check failed, allowing request:",
      error instanceof Error ? error.message : "unknown"
    );
    return {
      success: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowMs),
    };
  }
}

export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export const RATE_LIMITS = {
  application: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  // Step-1 lead capture fires (debounced) as the user types, so allow more.
  lead: { windowMs: 60 * 60 * 1000, maxRequests: 40 },
  presign: { windowMs: 10 * 60 * 1000, maxRequests: 30 },
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
} as const;
