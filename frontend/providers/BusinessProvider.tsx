"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import type { Business } from "@/types";
import type { Capability } from "@/config/business";
import {
  getDefaultCapabilities,
  mapLegacyBusinessType,
  getProfileForBusinessType,
  ALL_BUSINESS_TYPES,
} from "@/config/business";

type BusinessCapabilities = {
  businessType: string;
  originalBusinessType: string | null;
  profile: ReturnType<typeof getProfileForBusinessType>;
  enabledModules: Capability[];
  allCapabilities: Capability[];
};

type BusinessContextValue = {
  businesses: Business[];
  selected: Business | null;
  selectedId: string | null;
  selectBusiness: (id: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  capabilities: BusinessCapabilities | null;
  capabilitiesLoading: boolean;
  hasCapability: (cap: Capability) => boolean;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<BusinessCapabilities | null>(null);
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient<Business[]>("/businesses");
      setBusinesses(data);
      if (data.length > 0) {
        const saved = typeof window !== "undefined" ? localStorage.getItem("fd_business_id") : null;
        const valid = saved && data.find((b) => b.id === saved) ? saved : data[0].id;
        setSelectedId(valid);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCapabilities = useCallback(async (businessId: string) => {
    try {
      setCapabilitiesLoading(true);
      const data = await apiClient<BusinessCapabilities>(`/businesses/${businessId}/capabilities`);
      setCapabilities(data);
    } catch {
      // Fallback: derive from business data
      const biz = businesses.find((b) => b.id === businessId);
      const bType = mapLegacyBusinessType(biz?.businessType || null);
      const profile = getProfileForBusinessType(bType);
      let enabled = getDefaultCapabilities(bType);
      if (biz?.enabledModules) {
        try {
          const parsed = JSON.parse(biz.enabledModules);
          if (Array.isArray(parsed) && parsed.length > 0) enabled = parsed;
        } catch {}
      }
      setCapabilities({
        businessType: bType,
        originalBusinessType: biz?.businessType || null,
        profile,
        enabledModules: enabled,
        allCapabilities: profile.recommended.concat(profile.optional),
      });
    } finally {
      setCapabilitiesLoading(false);
    }
  }, [businesses]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedId) {
      fetchCapabilities(selectedId);
    }
  }, [selectedId, fetchCapabilities]);

  const selectBusiness = useCallback((id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") localStorage.setItem("fd_business_id", id);
  }, []);

  const selected = businesses.find((b) => b.id === selectedId) || null;

  const hasCapability = useCallback(
    (cap: Capability) => {
      if (!capabilities) return false;
      return capabilities.enabledModules.includes(cap);
    },
    [capabilities]
  );

  const refresh = useCallback(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        selected,
        selectedId,
        selectBusiness,
        loading,
        error,
        refresh,
        capabilities,
        capabilitiesLoading,
        hasCapability,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusinessContext must be used within BusinessProvider");
  return ctx;
}

export { BusinessContext };
