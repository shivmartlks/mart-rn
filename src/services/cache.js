// filepath: src/services/cache.js

const store = new Map();

// Set a value with TTL in milliseconds (default 5 minutes)
export function cacheSet(key, value, ttlMs = 5 * 60 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

// Get a cached value if not expired
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheClear(key) {
  if (key) store.delete(key);
  else store.clear();
}
