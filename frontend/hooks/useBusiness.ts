"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { Business } from "@/types";

export function useBusiness() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiClient<Business[]>("/businesses");
        if (cancelled) return;
        setBusinesses(data);
        if (data.length > 0) {
          const saved = typeof window !== "undefined" ? localStorage.getItem("fd_business_id") : null;
          const valid = saved && data.find((b) => b.id === saved) ? saved : data[0].id;
          setSelectedId(valid);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectBusiness = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") localStorage.setItem("fd_business_id", id);
  };

  const selected = businesses.find((b) => b.id === selectedId) || null;

  return { businesses, selected, selectedId, selectBusiness, loading, error, refresh: () => window.location.reload() };
}
