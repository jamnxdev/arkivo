type CacheBucket = "receipts" | "summary" | "timeseries" | "categories";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const CACHE_TTL_MS = 30_000;
// TODO(cache): move this cache to Redis/shared storage for multi-instance deployments.
const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(userId: string, bucket: CacheBucket) {
  return `${userId}:${bucket}`;
}

export function getCachedValue<T>(userId: string, bucket: CacheBucket): T | null {
  const key = getCacheKey(userId, bucket);
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCachedValue<T>(userId: string, bucket: CacheBucket, value: T) {
  const key = getCacheKey(userId, bucket);
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateUserAnalyticsCache(userId: string) {
  cache.delete(getCacheKey(userId, "receipts"));
  cache.delete(getCacheKey(userId, "summary"));
  cache.delete(getCacheKey(userId, "timeseries"));
  cache.delete(getCacheKey(userId, "categories"));
}

