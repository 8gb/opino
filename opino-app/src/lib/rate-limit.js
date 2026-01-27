import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis (will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
let redis;
try {
  redis = Redis.fromEnv();
} catch (e) {
  // Redis not configured - rate limiting will be disabled
  if (process.env.NODE_ENV === 'development') {
    console.warn('Upstash Redis not configured. Rate limiting is disabled.');
  }
}

// Different limits for different endpoints
export const rateLimiters = redis ? {
  // Comment submission: 5 per minute per IP
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "ratelimit:comment:",
  }),

  // Thread fetch: 30 per minute per IP
  thread: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "ratelimit:thread:",
  }),

  // Auth attempts: 5 per 15 minutes per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "900 s"),
    prefix: "ratelimit:auth:",
  }),

  // API general: 100 per minute per user
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "60 s"),
    prefix: "ratelimit:api:",
  }),
} : null;

export async function checkRateLimit(limiter, identifier) {
  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      headers: {},
    };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}
