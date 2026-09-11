"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

export type ServerStatus = "connected" | "disconnected" | "checking";

interface ServerStatusContextType {
  status: ServerStatus;
  lastChecked: Date | null;
  retry: () => void;
}

const ServerStatusContext = createContext<ServerStatusContextType>({
  status: "checking",
  lastChecked: null,
  retry: () => {},
});

export function useServerStatus() {
  return useContext(ServerStatusContext);
}

const HEALTH_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(
    /\/api\/v\d+\/?$/,
    ""
  ) + "/health";

const POLL_INTERVAL_MS = 30_000; // 30 s when connected
const RETRY_INTERVAL_MS = 8_000;  // 8 s when disconnected

async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_URL, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ServerStatus>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = (delayMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(poll, delayMs);
  };

  const poll = async () => {
    const ok = await checkHealth();
    setLastChecked(new Date());
    setStatus(ok ? "connected" : "disconnected");
    schedule(ok ? POLL_INTERVAL_MS : RETRY_INTERVAL_MS);
  };

  const retry = () => {
    setStatus("checking");
    if (timerRef.current) clearTimeout(timerRef.current);
    poll();
  };

  useEffect(() => {
    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ServerStatusContext.Provider value={{ status, lastChecked, retry }}>
      {children}
    </ServerStatusContext.Provider>
  );
}