"use client";

import Sidebar from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ServerStatusBanner } from "@/components/layout/ServerStatusBanner";
import { BusinessProvider } from "@/providers/BusinessProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <ServerStatusBanner />
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </BusinessProvider>
  );
}
