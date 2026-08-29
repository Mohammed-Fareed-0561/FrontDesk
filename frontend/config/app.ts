export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "FrontDesk",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
};

export const NAVIGATION = {
  dashboard: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Catalog", href: "/dashboard/catalog" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Bookings", href: "/dashboard/bookings" },
    { label: "Knowledge", href: "/dashboard/knowledge" },
    { label: "Memory", href: "/dashboard/memory" },
    { label: "Importer", href: "/dashboard/importer" },
    { label: "Website", href: "/dashboard/website" },
    { label: "Inbox", href: "/dashboard/inbox" },
    { label: "Insights", href: "/dashboard/insights" },
    { label: "Notifications", href: "/dashboard/notifications" },
    { label: "Automations", href: "/dashboard/automations" },
    { label: "Copilot", href: "/dashboard/copilot" },
    { label: "Activity", href: "/dashboard/activity" },
    { label: "Settings", href: "/dashboard/settings" },
  ],
};

export const BUSINESS_TYPES = [
  "bakery",
  "restaurant",
  "cafe",
  "retail",
  "salon",
  "clinic",
  "services",
  "other",
];
