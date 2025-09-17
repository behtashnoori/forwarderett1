import {
  getCache,
  setCache,
  makeGeoKey,
  clearCacheByPrefix,
} from "@/lib/cache";

export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }
  return (await response.json()) as T;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch (err) {
      if (response.ok) {
        throw new Error("پاسخ نامعتبر از سرور دریافت شد.");
      }
      data = raw;
    }
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`) as Error & {
      status?: number;
      payload?: unknown;
      raw?: string | null;
    };
    error.status = response.status;
    error.payload = data;
    error.raw = raw;
    throw error;
  }

  return (data as T) ?? ({} as T);
}

type ProvinceRow = { id: number; name_fa: string };
type CountyRow = { id: number; province_id: number; name_fa: string };
type CityRow = { id: number; county_id: number; name_fa: string };

export type GeoName = { id: number; name_fa: string | null } | null;
export type LocationSummary = {
  province: GeoName;
  county: GeoName;
  city: GeoName;
};

export const geoApi = {
  provinces: async (q = "", page = 1, limit = 50) => {
    const key = makeGeoKey("provinces", { q, page, limit });
    const cachedLocal = !q ? getCache<ProvinceRow[]>(key, "local") : null;
    if (cachedLocal) return cachedLocal;

    const cached = getCache<ProvinceRow[]>(key, "session");
    if (cached) return cached;

    const url = `${API_BASE}/geo/provinces?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
    const rows = await getJSON<ProvinceRow[]>(url);

    if (!q) {
      setCache(key, rows, 24 * 60 * 60 * 1000, "local");
    }
    setCache(key, rows, 15 * 60 * 1000, "session");
    return rows;
  },

  counties: async (province_id: number, q = "", page = 1, limit = 50) => {
    const key = makeGeoKey("counties", { province_id, q, page, limit });
    const cached = getCache<CountyRow[]>(key, "session");
    if (cached) return cached;

    const url = `${API_BASE}/geo/counties?province_id=${province_id}&q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
    const rows = await getJSON<CountyRow[]>(url);
    setCache(key, rows, 15 * 60 * 1000, "session");
    return rows;
  },

  cities: async (county_id: number, q = "", page = 1, limit = 50) => {
    const key = makeGeoKey("cities", { county_id, q, page, limit });
    const cached = getCache<CityRow[]>(key, "session");
    if (cached) return cached;

    const url = `${API_BASE}/geo/cities?county_id=${county_id}&q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
    const rows = await getJSON<CityRow[]>(url);
    setCache(key, rows, 15 * 60 * 1000, "session");
    return rows;
  },
};

export type CatalogItem = {
  id: number;
  code: string;
  name_fa: string | null;
};

export type CatalogResponse = {
  items: CatalogItem[];
  total: number;
};

const DEFAULT_CATALOG_LIMIT = 50;
const CATALOG_CACHE_PREFIX = "geo::catalog";

function catalogUrl(path: string, q: string, limit: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("limit", String(limit));
  return `${API_BASE}/catalog/${path}?${params.toString()}`;
}

export const catalogApi = {
  shipmentModes: (q = "", limit = DEFAULT_CATALOG_LIMIT) =>
    getJSON<CatalogResponse>(catalogUrl("shipment-modes", q, limit)),
  incoterms: (q = "", limit = DEFAULT_CATALOG_LIMIT) =>
    getJSON<CatalogResponse>(catalogUrl("incoterms", q, limit)),
  packageTypes: (q = "", limit = DEFAULT_CATALOG_LIMIT) =>
    getJSON<CatalogResponse>(catalogUrl("package-types", q, limit)),
  clearCache() {
    clearCacheByPrefix(CATALOG_CACHE_PREFIX, "session");
  },
};

export type CreateRequestPayload = {
  origin_province_id: number;
  origin_county_id: number;
  origin_city_id: number;
  dest_province_id: number;
  dest_county_id: number;
  dest_city_id: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  note_text?: string;
};

export type ShipmentRequestResponse = {
  id: number;
  status: string;
  sla_due_at: string;
};

export type ShipmentRequestDetails = {
  id: number;
  status: string;
  created_at: string | null;
  sla_due_at: string | null;
  origin: LocationSummary;
  destination: LocationSummary;
  contact: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  note_text: string | null;
  goods: {
    mode_shipment_mode: number | null;
    incoterm_code: string | null;
    is_hazardous: boolean | null;
    is_refrigerated: boolean | null;
    commodity_name: string | null;
    hs_code: string | null;
    package_type: number | null;
    units: number | null;
    length_cm: number | null;
    width_cm: number | null;
    height_cm: number | null;
    weight_kg: number | null;
    volume_m3: number | null;
    ready_date: string | null;
  };
};

export const requestApi = {
  create: (payload: CreateRequestPayload) =>
    fetch(`${API_BASE}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<ShipmentRequestResponse>;
    }),
  get: (id: number) =>
    fetch(`${API_BASE}/requests/${id}`).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<ShipmentRequestDetails>;
    }),
};

export type SubmitShipmentRequestPayload = {
  shipment_request_id?: number;
  origin_province_id: number;
  origin_county_id: number;
  origin_city_id: number;
  dest_province_id: number;
  dest_county_id: number;
  dest_city_id: number;
  mode_shipment_mode: number;
  incoterm_code?: string | null;
  package_type: number;
  units: number;
  commodity_name: string;
  hs_code?: string | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  weight_kg: number;
  volume_m3?: number | null;
  ready_date?: string | null;
  is_hazfreight?: boolean;
  is_refrigerated?: boolean;
  contact_name: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  note_text?: string | null;
};

export type SubmitShipmentResponse = {
  request_id: string | null;
  shipment_request_id: number;
  sla_hours: number | null;
};

export const shipmentApi = {
  submit: (payload: SubmitShipmentRequestPayload) =>
    postJSON<SubmitShipmentResponse>(`${API_BASE}/shipment-requests`, payload),
};

export const catalogCache = {
  clear() {
    clearCacheByPrefix(CATALOG_CACHE_PREFIX, "session");
  },
};
