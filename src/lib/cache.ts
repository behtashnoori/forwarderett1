export type CacheLayer = "session" | "local";

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 دقیقه

function now() {
  return Date.now();
}

function getStorage(layer: CacheLayer) {
  if (typeof window === "undefined") {
    return null;
  }
  return layer === "local" ? window.localStorage : window.sessionStorage;
}

export function getCache<T = unknown>(key: string, layer: CacheLayer = "session") {
  const storage = getStorage(layer);
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const { t, v, ttl } = JSON.parse(raw);
    if (ttl && now() - t > ttl) {
      storage.removeItem(key);
      return null;
    }
    return v as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function setCache<T>(
  key: string,
  value: T,
  ttlMs: number = DEFAULT_TTL_MS,
  layer: CacheLayer = "session"
) {
  const storage = getStorage(layer);
  if (!storage) return;
  const payload = JSON.stringify({ t: now(), v: value, ttl: ttlMs });
  storage.setItem(key, payload);
}

export function makeGeoKey(endpoint: string, params: Record<string, unknown>) {
  const qp = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .sort()
    .join("&");
  return `geo::${endpoint}${qp ? "::" + qp : ""}`;
}
