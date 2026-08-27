"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { getSession, setSession, clearSession, fetchCurrentUser, login as loginApi, signup as signupApi } from "@/lib/auth/session";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const session = getSession();
      if (session) {
        const freshUser = await fetchCurrentUser().catch(() => null);
        if (freshUser) {
          setUser(freshUser);
          setToken(session.token);
        } else {
          clearSession();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const session = await loginApi(email, password);
    setUser(session.user);
    setToken(session.token);
    router.push("/dashboard");
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    const session = await signupApi(email, password, displayName);
    setUser(session.user);
    setToken(session.token);
    router.push("/dashboard");
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
