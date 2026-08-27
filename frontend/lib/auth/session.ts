import { User } from "@/types";
import { apiClient, setAuthToken } from "@/lib/api/client";

export interface AuthSession {
  user: User;
  token: string;
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("fd_token");
  const userStr = localStorage.getItem("fd_user");
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession | null) {
  if (!session) {
    setAuthToken(null);
    localStorage.removeItem("fd_user");
  } else {
    setAuthToken(session.token);
    localStorage.setItem("fd_user", JSON.stringify(session.user));
  }
}

export function clearSession() {
  setSession(null);
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const data = await apiClient<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  const session: AuthSession = { user: data.user, token: data.token };
  setSession(session);
  return session;
}

export async function signup(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthSession> {
  const data = await apiClient<{ user: User; token: string }>("/auth/signup", {
    method: "POST",
    body: { email, password, displayName },
  });
  const session: AuthSession = { user: data.user, token: data.token };
  setSession(session);
  return session;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const session = getSession();
  if (!session) return null;
  try {
    const user = await apiClient<User>("/auth/me");
    const updatedSession: AuthSession = { token: session.token, user };
    setSession(updatedSession);
    return user;
  } catch {
    clearSession();
    return null;
  }
}

export function logout() {
  clearSession();
  window.location.href = "/login";
}
