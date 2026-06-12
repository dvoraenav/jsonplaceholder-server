// ==========================================
// In-Memory API Cache (Client-to-Server Optimization)
// ==========================================
// Stores GET responses in a Map keyed by the request URL so repeated
// reads of the same resource are served instantly without hitting the
// network. Mutations (POST/PUT/DELETE) update or invalidate only the
// affected key, never the whole cache.

const cache = new Map();

/**
 * Fetch a URL, returning cached data when available.
 * On a cache miss it performs the network request, stores the JSON
 * result under the URL key, and returns it.
 *
 * @param {string} url - The request URL (used as the cache key).
 * @param {object} [options] - Optional settings.
 * @param {boolean} [options.force=false] - Bypass the cache and refetch.
 * @returns {Promise<any>} The parsed JSON response.
 */
export async function fetchWithCache(url, { force = false } = {}) {
  if (!force && cache.has(url)) {
    return cache.get(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, data);
  return data;
}

/**
 * Remove a single URL key from the cache so the next read refetches it.
 * @param {string} url - The exact cache key to invalidate.
 */
export function invalidateCache(url) {
  cache.delete(url);
}

/**
 * Update a cached entry in place without a network request.
 * The updater receives the current cached value (or undefined if the
 * key is absent) and returns the new value to store. If the updater
 * returns undefined, the entry is left untouched.
 *
 * @param {string} url - The cache key to update.
 * @param {(current: any) => any} updaterFunction - Produces the new value.
 */
export function updateCacheItem(url, updaterFunction) {
  if (!cache.has(url)) return;
  const next = updaterFunction(cache.get(url));
  if (next !== undefined) {
    cache.set(url, next);
  }
}

/**
 * Manually write a value into the cache for a given URL key.
 * @param {string} url - The cache key.
 * @param {any} data - The value to store.
 */
export function setCache(url, data) {
  cache.set(url, data);
}

/**
 * Clear the entire cache. Use sparingly (e.g. on logout).
 */
export function clearCache() {
  cache.clear();
}
