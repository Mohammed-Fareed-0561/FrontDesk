"use client";

import { useAuth } from "@/providers/AuthProvider";
import { BusinessProvider } from "@/providers/BusinessProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <BusinessProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </BusinessProvider>
  );
}
