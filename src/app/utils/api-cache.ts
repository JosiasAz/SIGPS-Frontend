/** Cache em memória + sessionStorage para respostas GET — navegação instantânea ao revisitar telas. */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const SESSION_PREFIX = 'sigps_cache:';

export function cacheGet<T>(key: string, opts?: { session?: boolean }): T | null {
  const entry = store.get(key);
  if (entry) {
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
    } else {
      return entry.data as T;
    }
  }

  if (opts?.session && typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(SESSION_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(SESSION_PREFIX + key);
        return null;
      }
      store.set(key, parsed);
      return parsed.data;
    } catch {
      return null;
    }
  }

  return null;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number, opts?: { session?: boolean }): void {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
  store.set(key, entry);

  if (opts?.session && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(entry));
    } catch {
      /* quota exceeded — memória continua válida */
    }
  }
}

export function cacheInvalidate(prefix?: string): void {
  if (!prefix) {
    store.clear();
    if (typeof sessionStorage !== 'undefined') {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(SESSION_PREFIX)) sessionStorage.removeItem(k);
      }
    }
    return;
  }

  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  if (typeof sessionStorage !== 'undefined') {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(SESSION_PREFIX + prefix)) sessionStorage.removeItem(k);
    }
  }
}

export function cacheKey(parts: (string | number | null | undefined)[]): string {
  return parts.map(p => (p === null || p === undefined ? '_' : String(p))).join(':');
}

/** Retorna cache imediatamente e indica se está stale (para revalidar em background). */
export function cacheGetStale<T>(key: string, opts?: { session?: boolean }): { data: T; stale: boolean } | null {
  const entry = store.get(key);
  const now = Date.now();
  if (entry) {
    return { data: entry.data as T, stale: now > entry.expiresAt };
  }
  const data = cacheGet<T>(key, opts);
  if (data) return { data, stale: false };
  return null;
}
