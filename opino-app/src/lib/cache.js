import { Redis } from "@upstash/redis";
import { logger } from './logger';

// Initialize Redis (will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
let redis;
try {
  redis = Redis.fromEnv();
} catch (e) {
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Upstash Redis not configured. Caching is disabled.');
  }
}

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  COMMENTS: 604800,   // 1 week
  SITE: 604800,       // 1 week
  STATS: 604800,      // 1 week
  DEFAULT: 604800,    // 1 week
};

/**
 * Get data from cache or fetch if not cached
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 * @returns {Promise<any>} - Cached or fetched data
 */
export async function getCached(key, fetcher, ttl = CACHE_TTL.DEFAULT) {
  // If Redis is not configured, directly fetch
  if (!redis) {
    return fetcher();
  }

  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached !== null) {
      logger.debug(`Cache hit for key: ${key}`);
      // Redis automatically deserializes JSON
      return cached;
    }

    logger.debug(`Cache miss for key: ${key}`);
    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    if (data !== null && data !== undefined) {
      await redis.setex(key, ttl, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    logger.warn('Cache operation failed, falling back to direct fetch:', error);
    // Fallback to direct fetch if cache fails
    return fetcher();
  }
}

/**
 * Invalidate cache by exact key
 * @param {string} key - Cache key to invalidate
 */
export async function invalidateCache(key) {
  if (!redis) return;

  try {
    await redis.del(key);
    logger.debug(`Cache invalidated for key: ${key}`);
  } catch (error) {
    logger.warn('Cache invalidation failed:', error);
  }
}

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match keys (e.g., "comments:*")
 */
export async function invalidateCachePattern(pattern) {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(`Cache invalidated for pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.warn('Cache pattern invalidation failed:', error);
  }
}

/**
 * Set cache value directly
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function setCache(key, value, ttl = CACHE_TTL.DEFAULT) {
  if (!redis) return;

  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    logger.debug(`Cache set for key: ${key}`);
  } catch (error) {
    logger.warn('Cache set failed:', error);
  }
}

/**
 * Get cache value directly
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
export async function getCache(key) {
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    if (value !== null) {
      logger.debug(`Cache hit for key: ${key}`);
    }
    return value;
  } catch (error) {
    logger.warn('Cache get failed:', error);
    return null;
  }
}

/**
 * Increment a counter in cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} - New counter value
 */
export async function incrementCache(key) {
  if (!redis) return 0;

  try {
    const value = await redis.incr(key);
    return value;
  } catch (error) {
    logger.warn('Cache increment failed:', error);
    return 0;
  }
}

/**
 * Cache key builders for consistency
 */
export const cacheKeys = {
  comments: (siteId, pathname) => `comments:${siteId}:${pathname}`,
  commentsList: (userId, siteId = 'all') => `comments:list:${userId}:${siteId}`,
  site: (siteId) => `site:${siteId}`,
  sitesList: (userId) => `sites:list:${userId}`,
  stats: (userId) => `stats:${userId}`,
  threadCount: (siteId, pathname) => `thread:count:${siteId}:${pathname}`,
};

export default {
  getCached,
  invalidateCache,
  invalidateCachePattern,
  setCache,
  getCache,
  incrementCache,
  cacheKeys,
  CACHE_TTL,
};
