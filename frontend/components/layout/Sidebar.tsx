"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/config/app";
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
  Upload,
  BarChart3,
  Settings,
  Menu,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/providers/AuthProvider";

const iconMap: Record<string, React.ElementType> = {
  Dashboard: Home,
  Catalog: Package,
  Orders: ShoppingBag,
  Bookings: Calendar,
  Knowledge: BookOpen,
  Memory: Brain,
  Importer: Upload,
  Website: Globe,
  Inbox: Inbox,
  Insights: Lightbulb,
  Copilot: Bot,
  Activity: BarChart3,
  Settings: Settings,
  Business: FileText,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold text-primary">FrontDesk</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {NAVIGATION.dashboard.map((item) => {
              const Icon = iconMap[item.label] || Home;
              const href = item.href;
              const isActive = pathname === href;
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={logout}
          >
            <LifeBuoy className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebar />
    </>
  );
}

function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="ml-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="mt-8 flex flex-col space-y-1">
            {NAVIGATION.dashboard.map((item) => {
              const Icon = iconMap[item.label] || Home;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
