const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export class ApiError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fd_token");
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("fd_token", token);
  } else {
    localStorage.removeItem("fd_token");
  }
}

function buildUrl(path: string, params?: ApiOptions["params"]): string {
  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiClient<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false, params } = options;

  const url = buildUrl(path, params);
  const token = skipAuth ? null : getAuthToken();

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: fetchHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = data?.error || { code: "REQUEST_FAILED", message: response.statusText };
    throw new ApiError(
      err.message || "Request failed",
      err.code || "REQUEST_FAILED",
      response.status,
      err.details
    );
  }

  return data.data as T;
}

export async function apiClientRaw(path: string, options: ApiOptions = {}): Promise<any> {
  const { method = "GET", body, headers = {}, skipAuth = false, params } = options;

  const url = buildUrl(path, params);
  const token = skipAuth ? null : getAuthToken();

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: fetchHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = data?.error || { code: "REQUEST_FAILED", message: response.statusText };
    throw new ApiError(
      err.message || "Request failed",
      err.code || "REQUEST_FAILED",
      response.status,
      err.details
    );
  }

  return data;
}
