import {
  getCache,
  setCache,
  makeGeoKey,
  clearCache,
  clearCacheByPrefix,
} from "@/lib/cache";

export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
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

export type ModeOption = { value: string; label_fa: string };
export type PackageTypeOption = { value: string; label_fa: string };
export type IncotermOption = {
  id: number;
  code: string;
  name_fa: string | null;
  desc_fa: string | null;
  modes: string | null;
};

const META_PREFIX = "geo::meta";
const META_MODES_KEY = `${META_PREFIX}::modes`;
const META_PACKAGES_KEY = `${META_PREFIX}::packages`;

const metaCacheKeyForIncoterms = (mode: string) =>
  `${META_PREFIX}::incoterms::mode=${mode.toLowerCase()}`;

export const metaApi = {
  async getModes() {
    const cached = getCache<ModeOption[]>(META_MODES_KEY, "session");
    if (cached) return cached;
    const rows = await getJSON<ModeOption[]>(`${API_BASE}/meta/modes`);
    setCache(META_MODES_KEY, rows, 15 * 60 * 1000, "session");
    return rows;
  },
  async getPackageTypes() {
    const cached = getCache<PackageTypeOption[]>(META_PACKAGES_KEY, "session");
    if (cached) return cached;
    const rows = await getJSON<PackageTypeOption[]>(`${API_BASE}/meta/package-types`);
    setCache(META_PACKAGES_KEY, rows, 15 * 60 * 1000, "session");
    return rows;
  },
  async getIncoterms(mode: string) {
    const key = metaCacheKeyForIncoterms(mode);
    const cached = getCache<IncotermOption[]>(key, "session");
    if (cached) return cached;
    const rows = await getJSON<IncotermOption[]>(
      `${API_BASE}/meta/incoterms?mode=${encodeURIComponent(mode)}`,
    );
    setCache(key, rows, 15 * 60 * 1000, "session");
    return rows;
  },
  clearGoodsMetaCache() {
    clearCache(META_MODES_KEY, "session");
    clearCache(META_PACKAGES_KEY, "session");
    clearCacheByPrefix(`${META_PREFIX}::incoterms`, "session");
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
    mode_shipment_mode: string | null;
    incoterm_code: string | null;
    is_hazardous: boolean | null;
    is_refrigerated: boolean | null;
    commodity_name: string | null;
    hs_code: string | null;
    package_type: string | null;
    units: number | null;
    length_cm: number | null;
    width_cm: number | null;
    height_cm: number | null;
    weight_kg: number | null;
    volume_m3: number | null;
    ready_at: string | null;
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

export type ShipmentDraftPayload = {
  mode_shipment: string;
  incoterm_code_text?: string;
  is_hazfreight?: boolean;
  is_refrigerated?: boolean;
  commodity_name: string;
  hs_code_text?: string;
  package_type_text: string;
  units: number;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  volume_cbm?: number | null;
  ready_date?: string;
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
  note_text?: string;
};

export type ShipmentDraftResponse = {
  ok: boolean;
  volume_cbm: number;
};

export type ValidationErrorPayload = {
  error?: string;
  details?: { type?: string; fields?: Record<string, string> };
  request_id?: string;
};

export const shipmentApi = {
  async validateDraft(payload: ShipmentDraftPayload) {
    const response = await fetch(`${API_BASE}/shipment/validate-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data: ShipmentDraftResponse | ValidationErrorPayload | null = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const error = new Error("VALIDATION_ERROR");
      (error as Error & { status?: number; payload?: typeof data }).status =
        response.status;
      (error as Error & { status?: number; payload?: typeof data }).payload = data;
      throw error;
    }

    return (data as ShipmentDraftResponse) ?? { ok: true, volume_cbm: 0 };
  },
};
