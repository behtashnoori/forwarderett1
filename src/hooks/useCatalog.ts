import { useEffect, useMemo, useState } from "react";

import { catalogApi, type CatalogItem, type CatalogResponse } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";

const TTL = 15 * 60 * 1000;
const LIMIT = 50;

function makeKey(endpoint: string, q: string) {
  return `geo::catalog/${endpoint}::q=${encodeURIComponent(q)}&page=1&limit=${LIMIT}`;
}

type CatalogState = {
  items: CatalogItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

function useCatalogEndpoint(
  endpoint: "shipment-modes" | "incoterms" | "package-types",
  q: string,
): CatalogState {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let cancelled = false;
    const key = makeKey(endpoint, query);
    const cached = getCache<CatalogResponse>(key, "session");
    if (cached) {
      setItems(cached.items);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    let request: Promise<CatalogResponse>;
    switch (endpoint) {
      case "shipment-modes":
        request = catalogApi.shipmentModes(query, LIMIT);
        break;
      case "incoterms":
        request = catalogApi.incoterms(query, LIMIT);
        break;
      default:
        request = catalogApi.packageTypes(query, LIMIT);
        break;
    }

    request
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setCache(key, data, TTL, "session");
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("خطا در دریافت اطلاعات.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, query, nonce]);

  return {
    items,
    loading,
    error,
    refresh: () => setNonce((v) => v + 1),
  };
}

export function useShipmentModes(q = "") {
  return useCatalogEndpoint("shipment-modes", q);
}

export function useIncoterms(q = "") {
  return useCatalogEndpoint("incoterms", q);
}

export function usePackageTypes(q = "") {
  return useCatalogEndpoint("package-types", q);
}
