import { Redis } from "@upstash/redis";
import { logger } from './logger';

// Initialize Redis (will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
let redis;
try {
  redis = Redis.fromEnv();
  console.log('[CACHE] Redis initialized successfully');

  // Test Redis connection on initialization
  if (redis) {
    redis.ping().then(() => {
      console.log('[CACHE] Redis connection verified - PING successful');
    }).catch(err => {
      console.error('[CACHE] Redis connection test failed:', err.message);
    });
  }
} catch (e) {
  console.error('[CACHE] Failed to initialize Redis:', e.message);
  logger.warn('Upstash Redis not configured. Caching is disabled.');
}

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  COMMENTS: 2592000,   // 1 month (30 days)
  SITE: 2592000,       // 1 month (30 days)
  STATS: 2592000,      // 1 month (30 days)
  DEFAULT: 2592000,    // 1 month (30 days)
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
    console.log(`[CACHE] Redis not configured, skipping cache for key: ${key}`);
    return fetcher();
  }

  const startTime = Date.now();

  try {
    // Try to get from cache
    const cached = await redis.get(key);
    const cacheCheckTime = Date.now() - startTime;

    if (cached !== null && cached !== undefined) {
      console.log(`[CACHE] ✓ HIT for key: ${key} (${cacheCheckTime}ms)`);
      try {
        // Parse JSON string back to object
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch (parseError) {
        console.error(`[CACHE] Failed to parse cached data for key: ${key}`, parseError.message);
        // If parsing fails, invalidate cache and fetch fresh data
        await redis.del(key);
      }
    }

    console.log(`[CACHE] ✗ MISS for key: ${key} (${cacheCheckTime}ms) - fetching fresh data`);
    // Fetch fresh data
    const fetchStart = Date.now();
    const data = await fetcher();
    const fetchTime = Date.now() - fetchStart;

    // Store in cache
    if (data !== null && data !== undefined) {
      const cacheSetStart = Date.now();
      await redis.setex(key, ttl, JSON.stringify(data));
      const cacheSetTime = Date.now() - cacheSetStart;
      console.log(`[CACHE] ✓ SET for key: ${key} (TTL: ${ttl}s, fetch: ${fetchTime}ms, set: ${cacheSetTime}ms)`);
    } else {
      console.log(`[CACHE] ✗ Not caching null/undefined data for key: ${key}`);
    }

    return data;
  } catch (error) {
    console.error(`[CACHE] Operation failed for key: ${key}, falling back to direct fetch:`, error.message);
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
    if (value !== null && value !== undefined) {
      logger.debug(`Cache hit for key: ${key}`);
      // Parse JSON if it's a string
      return typeof value === 'string' ? JSON.parse(value) : value;
    }
    return null;
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
