import { useEffect, useMemo, useState } from "react";
import { geoApi } from "@/lib/api";
import { debounce } from "./Debounce";

type Sel = { id: number; name_fa: string };

export type GeoValue = {
  province_id?: number;
  county_id?: number;
  city_id?: number;
};

export function CascadingSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GeoValue;
  onChange: (v: GeoValue) => void;
}) {
  const [provQ, setProvQ] = useState("");
  const [provList, setProvList] = useState<Sel[]>([]);
  const [countyQ, setCountyQ] = useState("");
  const [countyList, setCountyList] = useState<Sel[]>([]);
  const [cityQ, setCityQ] = useState("");
  const [cityList, setCityList] = useState<Sel[]>([]);

  const fetchProv = useMemo(
    () =>
      debounce(async (q: string) => {
        const rows = await geoApi.provinces(q);
        setProvList(rows);
      }, 300),
    []
  );

  const fetchCounty = useMemo(
    () =>
      debounce(async (pid: number, q: string) => {
        if (!pid) return setCountyList([]);
        const rows = await geoApi.counties(pid, q);
        setCountyList(rows);
      }, 300),
    []
  );

  const fetchCity = useMemo(
    () =>
      debounce(async (cid: number, q: string) => {
        if (!cid) return setCityList([]);
        const rows = await geoApi.cities(cid, q);
        setCityList(rows);
      }, 300),
    []
  );

  // initial load of provinces
  useEffect(() => {
    fetchProv("");
  }, [fetchProv]);

  // when province changes, reset county/city
  function setProvince(id?: number) {
    onChange({ province_id: id, county_id: undefined, city_id: undefined });
    setCountyList([]);
    setCityList([]);
    if (id) fetchCounty(id, "");
  }
  function setCounty(id?: number) {
    const pid = value.province_id!;
    onChange({ province_id: pid, county_id: id, city_id: undefined });
    setCityList([]);
    if (id) fetchCity(id, "");
  }
  function setCity(id?: number) {
    onChange({ ...value, city_id: id });
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{label}</div>

      {/* Province */}
      <div className="space-y-1">
        <input
          placeholder="جست‌وجوی استان…"
          className="w-full"
          onChange={(e) => {
            setProvQ(e.target.value);
            fetchProv(e.target.value);
          }}
          value={provQ}
        />
        <select
          className="w-full"
          value={value.province_id ?? ""}
          onChange={(e) => setProvince(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">انتخاب استان</option>
          {provList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_fa}
            </option>
          ))}
        </select>
      </div>

      {/* County */}
      <div className="space-y-1">
        <input
          placeholder="جست‌وجوی شهرستان…"
          className="w-full"
          disabled={!value.province_id}
          onChange={(e) => {
            setCountyQ(e.target.value);
            if (value.province_id) fetchCounty(value.province_id, e.target.value);
          }}
          value={countyQ}
        />
        <select
          className="w-full"
          disabled={!value.province_id}
          value={value.county_id ?? ""}
          onChange={(e) => setCounty(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">{value.province_id ? "انتخاب شهرستان" : "ابتدا استان را انتخاب کنید"}</option>
          {countyList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_fa}
            </option>
          ))}
        </select>
        {!value.province_id && (
          <div className="text-xs mt-1 text-destructive">ابتدا استان را انتخاب کنید.</div>
        )}
      </div>

      {/* City */}
      <div className="space-y-1">
        <input
          placeholder="جست‌وجوی شهر…"
          className="w-full"
          disabled={!value.county_id}
          onChange={(e) => {
            setCityQ(e.target.value);
            if (value.county_id) fetchCity(value.county_id, e.target.value);
          }}
          value={cityQ}
        />
        <select
          className="w-full"
          disabled={!value.county_id}
          value={value.city_id ?? ""}
          onChange={(e) => setCity(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">{value.county_id ? "انتخاب شهر" : "ابتدا شهرستان را انتخاب کنید"}</option>
          {cityList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_fa}
            </option>
          ))}
        </select>
        {!value.county_id && (
          <div className="text-xs mt-1 text-destructive">ابتدا شهرستان را انتخاب کنید.</div>
        )}
      </div>

      {/* breadcrumb */}
      <div className="text-xs text-muted-foreground">استان › شهرستان › شهر</div>
    </div>
  );
}
