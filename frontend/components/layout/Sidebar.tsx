"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBusinessContext } from "@/providers/BusinessProvider";
import { getNavigationForCapabilities } from "@/config/business";
import {
  Home,
  Package,
  ShoppingBag,
  Calendar,
  BookOpen,
  Brain,
  Globe,
  Inbox,
  Bot,
  Lightbulb,
  Zap,
  Bell,
  Upload,
  BarChart3,
  Settings,
  Menu,
  FileText,
  LifeBuoy,
  Users,
  Target,
  CreditCard,
  Layers,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";

const iconMap: Record<string, React.ElementType> = {
  Dashboard: Home,
  Home: Home,
  Catalog: Package,
  Orders: ShoppingBag,
  Bookings: Calendar,
  Knowledge: BookOpen,
  Memory: Brain,
  Importer: Upload,
  Website: Globe,
  Inbox: Inbox,
  Insights: Lightbulb,
  Automations: Zap,
  Notifications: Bell,
  Copilot: Bot,
  Activity: BarChart3,
  Settings: Settings,
  Business: FileText,
  Customers: Users,
  Leads: Target,
  Payments: CreditCard,
  Services: Layers,
  Menu: BookOpen,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { capabilities } = useBusinessContext();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = capabilities
    ? getNavigationForCapabilities(capabilities.enabledModules)
    : getNavigationForCapabilities([]);

  return (
    <TooltipProvider delayDuration={150}>
      <>
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden flex-col border-r bg-card/60 backdrop-blur-md transition-all duration-300 md:flex z-20 select-none",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Header Branding & Collapse Toggle */}
          <div className="flex h-14 items-center justify-between border-b px-3.5">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity overflow-hidden",
                collapsed ? "justify-center w-full" : ""
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/20 font-extrabold text-sm">
                FD
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold leading-none text-foreground flex items-center gap-1">
                    FrontDesk
                    <span className="rounded bg-indigo-500/10 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      OS
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal leading-tight mt-0.5 truncate">
                    Business Operating System
                  </span>
                </div>
              )}
            </Link>

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || Home;
              const href = item.href;
              const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

              const linkContent = (
                <Link
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    collapsed && "justify-center px-2 py-2.5"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>

          {/* Footer / Expand & Signout */}
          <div className="border-t p-2 space-y-1 bg-muted/20">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-8 justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => setCollapsed(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Expand sidebar
                </TooltipContent>
              </Tooltip>
            ) : null}

            {!collapsed ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-8 justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs text-destructive">
                  Sign out
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <MobileSidebar navItems={navItems} pathname={pathname} logout={logout} />
      </>
    </TooltipProvider>
  );
}

function MobileSidebar({
  navItems,
  pathname,
  logout,
}: {
  navItems: Array<{ href: string; label: string; icon: string }>;
  pathname: string;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-3 left-3 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-md shadow-xs">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="border-b px-4 py-3 text-left">
              <SheetTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                  FD
                </div>
                FrontDesk Business OS
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || Home;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t p-3 bg-muted/20">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-destructive" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Bottom Quick Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-lg border-t z-30 flex items-center justify-around px-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
            pathname === "/dashboard" ? "text-indigo-600 font-bold" : "text-muted-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/dashboard/website"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
            pathname.startsWith("/dashboard/website") ? "text-indigo-600 font-bold" : "text-muted-foreground"
          )}
        >
          <Globe className="h-4 w-4" />
          <span>Website</span>
        </Link>
        <Link
          href="/dashboard/inbox"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
            pathname.startsWith("/dashboard/inbox") ? "text-indigo-600 font-bold" : "text-muted-foreground"
          )}
        >
          <Inbox className="h-4 w-4" />
          <span>Inbox</span>
        </Link>
        <Link
          href="/dashboard/business"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
            pathname.startsWith("/dashboard/business") ? "text-indigo-600 font-bold" : "text-muted-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Business</span>
        </Link>
      </div>
    </>
  );
}
