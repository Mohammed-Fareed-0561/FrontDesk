"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useBusinessContext } from "@/providers/BusinessProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessSwitcher } from "./BusinessSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  ChevronDown,
  Globe,
  Search,
  Sparkles,
  User,
  Settings,
  Building2,
  Upload,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { initials } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Topbar() {
  const { user, logout } = useAuth();
  const { selected } = useBusinessContext();
  const router = useRouter();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-md px-4 sticky top-0 z-30">
      {/* Left section: Business Switcher */}
      <div className="flex items-center gap-3">
        <BusinessSwitcher />
        {selected?.slug && (
          <Link
            href={`/b/${selected.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border px-2 py-1 rounded-md bg-muted/40"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="font-medium">Live Store</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
        )}
      </div>

      {/* Center section: Global AI/Search Entry Point */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div
          onClick={() => router.push("/dashboard/website")}
          className="flex items-center gap-2 w-full h-8 px-3 rounded-lg border bg-muted/30 text-muted-foreground text-xs hover:border-primary/50 transition-all cursor-pointer group"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="flex-1 truncate">Ask Copilot or search features...</span>
          <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-mono text-muted-foreground opacity-80">
            <Sparkles className="h-2.5 w-2.5 text-indigo-500 mr-0.5" />
            Cmd+K
          </kbd>
        </div>
      </div>

      {/* Right section: Notifications & User Profile */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 hover:bg-accent/60">
              <Avatar className="h-7 w-7 border">
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium sm:inline-block max-w-[120px] truncate">
                {user?.displayName || user?.email}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-0.5">
                <span className="text-xs font-semibold">{user?.displayName || "User"}</span>
                <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                Settings &amp; Features
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/dashboard/business" className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Business Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/dashboard/importer" className="flex items-center gap-2">
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                Import Data
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              className="cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
