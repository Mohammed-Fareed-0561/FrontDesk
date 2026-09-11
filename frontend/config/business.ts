export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  bakery: "Bakery",
  salon: "Salon",
  barbershop: "Barbershop",
  clinic: "Clinic",
  retail: "Retail",
  ecommerce: "E-commerce",
  agency: "Agency",
  freelancer: "Freelancer",
  consultant: "Consultant",
  education: "Education",
  real_estate: "Real Estate",
  service_business: "Service Business",
  portfolio: "Portfolio",
  other: "Other",
};

export const ALL_BUSINESS_TYPES = Object.keys(BUSINESS_TYPE_LABELS);

export const CAPABILITY = {
  WEBSITE: "website",
  CATALOG: "catalog",
  MENU: "menu",
  ORDERS: "orders",
  BOOKINGS: "bookings",
  SERVICES: "services",
  CUSTOMERS: "customers",
  INBOX: "inbox",
  LEADS: "leads",
  PAYMENTS: "payments",
  KNOWLEDGE: "knowledge",
  AI_ASSISTANT: "ai_assistant",
  AUTOMATIONS: "automations",
  INSIGHTS: "insights",
  IMPORTER: "importer",
} as const;

export type Capability = (typeof CAPABILITY)[keyof typeof CAPABILITY];

export const ALL_CAPABILITIES: Capability[] = Object.values(CAPABILITY);

export const CAPABILITY_LABELS: Record<Capability, string> = {
  website: "Website",
  catalog: "Catalog",
  menu: "Menu",
  orders: "Orders",
  bookings: "Bookings",
  services: "Services",
  customers: "Customers",
  inbox: "Inbox",
  leads: "Leads",
  payments: "Payments",
  knowledge: "Business Info",
  ai_assistant: "AI Assistant",
  automations: "Smart Rules",
  insights: "Insights",
  importer: "Import Data",
};

export const CAPABILITY_DESCRIPTIONS: Record<Capability, string> = {
  website: "Build and publish your online presence",
  catalog: "Showcase your products with images and prices",
  menu: "Display your menu with categories and pricing",
  orders: "Accept and manage customer orders",
  bookings: "Let customers book appointments or reservations",
  services: "List your services with descriptions and pricing",
  customers: "Keep track of your customers and their history",
  inbox: "Manage messages and enquiries from customers",
  leads: "Capture and track potential customers",
  payments: "Record and track payments",
  knowledge: "Store business information for AI assistance",
  ai_assistant: "AI-powered suggestions and responses",
  automations: "Automate repetitive tasks and responses",
  insights: "See trends and analytics for your business",
  importer: "Import data from spreadsheets and other tools",
};

export type BusinessTypeProfile = {
  label: string;
  recommended: Capability[];
  optional: Capability[];
  templateCategory: string;
};

export const BUSINESS_PROFILES: Record<string, BusinessTypeProfile> = {
  restaurant: {
    label: "Restaurant",
    recommended: ["website", "menu", "orders", "bookings", "customers", "inbox", "insights"],
    optional: ["catalog", "payments", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "restaurant",
  },
  cafe: {
    label: "Cafe",
    recommended: ["website", "menu", "orders", "bookings", "customers", "inbox", "insights"],
    optional: ["catalog", "payments", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "restaurant",
  },
  bakery: {
    label: "Bakery",
    recommended: ["website", "catalog", "orders", "bookings", "customers", "inbox", "insights"],
    optional: ["menu", "payments", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "restaurant",
  },
  salon: {
    label: "Salon",
    recommended: ["website", "services", "bookings", "customers", "inbox", "insights"],
    optional: ["catalog", "payments", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "salon",
  },
  barbershop: {
    label: "Barbershop",
    recommended: ["website", "services", "bookings", "customers", "inbox", "insights"],
    optional: ["catalog", "payments", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "salon",
  },
  clinic: {
    label: "Clinic",
    recommended: ["website", "services", "bookings", "customers", "inbox", "insights"],
    optional: ["payments", "knowledge", "ai_assistant", "automations"],
    templateCategory: "services",
  },
  retail: {
    label: "Retail",
    recommended: ["website", "catalog", "orders", "customers", "inbox", "insights"],
    optional: ["bookings", "payments", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "ecommerce",
  },
  ecommerce: {
    label: "E-commerce",
    recommended: ["website", "catalog", "orders", "payments", "customers", "inbox", "insights"],
    optional: ["bookings", "knowledge", "ai_assistant", "automations", "importer"],
    templateCategory: "ecommerce",
  },
  agency: {
    label: "Agency",
    recommended: ["website", "services", "leads", "customers", "inbox", "insights"],
    optional: ["bookings", "catalog", "payments", "knowledge", "ai_assistant", "automations"],
    templateCategory: "portfolio",
  },
  freelancer: {
    label: "Freelancer",
    recommended: ["website", "services", "leads", "customers", "inbox", "insights"],
    optional: ["bookings", "catalog", "payments", "knowledge", "ai_assistant"],
    templateCategory: "portfolio",
  },
  consultant: {
    label: "Consultant",
    recommended: ["website", "services", "bookings", "leads", "customers", "inbox", "insights"],
    optional: ["catalog", "payments", "knowledge", "ai_assistant", "automations"],
    templateCategory: "portfolio",
  },
  education: {
    label: "Education",
    recommended: ["website", "services", "bookings", "customers", "inbox", "insights"],
    optional: ["catalog", "orders", "payments", "knowledge", "ai_assistant", "automations"],
    templateCategory: "services",
  },
  real_estate: {
    label: "Real Estate",
    recommended: ["website", "catalog", "leads", "customers", "inbox", "insights"],
    optional: ["bookings", "payments", "knowledge", "ai_assistant", "automations"],
    templateCategory: "portfolio",
  },
  service_business: {
    label: "Service Business",
    recommended: ["website", "services", "bookings", "customers", "inbox", "insights"],
    optional: ["catalog", "orders", "payments", "knowledge", "ai_assistant", "automations"],
    templateCategory: "services",
  },
  portfolio: {
    label: "Portfolio",
    recommended: ["website", "services", "leads", "inbox", "insights"],
    optional: ["customers", "bookings", "knowledge", "ai_assistant"],
    templateCategory: "portfolio",
  },
  other: {
    label: "Other",
    recommended: ["website", "customers", "inbox", "insights"],
    optional: ["catalog", "orders", "bookings", "services", "payments", "knowledge", "ai_assistant", "automations", "importer", "leads"],
    templateCategory: "portfolio",
  },
};

export function getProfileForBusinessType(businessType: string | null): BusinessTypeProfile {
  if (!businessType) return BUSINESS_PROFILES.other;
  return BUSINESS_PROFILES[businessType] || BUSINESS_PROFILES.other;
}

export function getDefaultCapabilities(businessType: string | null): Capability[] {
  const profile = getProfileForBusinessType(businessType);
  return [...profile.recommended];
}

export function mapLegacyBusinessType(raw: string | null): string {
  if (!raw) return "other";
  const normalized = raw.toLowerCase().trim();
  if (ALL_BUSINESS_TYPES.includes(normalized)) return normalized;
  const aliases: Record<string, string> = {
    food: "restaurant",
    dine: "restaurant",
    dining: "restaurant",
    coffee: "cafe",
    coffee_shop: "cafe",
    pastry: "bakery",
    cake: "bakery",
    hair: "salon",
    beauty: "salon",
    spa: "salon",
    hair_salon: "salon",
    barber: "barbershop",
    medical: "clinic",
    doctor: "clinic",
    healthcare: "clinic",
    shop: "retail",
    store: "retail",
    boutique: "retail",
    online_store: "ecommerce",
    digital: "ecommerce",
    marketing: "agency",
    design: "agency",
    creative: "agency",
    dev: "freelancer",
    developer: "freelancer",
    photographer: "freelancer",
    writer: "freelancer",
    tutor: "education",
    school: "education",
    coaching: "education",
    training: "education",
    property: "real_estate",
    housing: "real_estate",
    plumbing: "service_business",
    electrician: "service_business",
    cleaning: "service_business",
    photography: "portfolio",
    personal: "portfolio",
  };
  return aliases[normalized] || "other";
}

export const NAV_ITEMS: Record<Capability, { label: string; href: string; icon: string }> = {
  website: { label: "Website", href: "/dashboard/website", icon: "Globe" },
  catalog: { label: "Catalog", href: "/dashboard/catalog", icon: "Package" },
  menu: { label: "Menu", href: "/dashboard/catalog", icon: "BookOpen" },
  orders: { label: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
  bookings: { label: "Bookings", href: "/dashboard/bookings", icon: "Calendar" },
  services: { label: "Services", href: "/dashboard/catalog", icon: "Layers" },
  customers: { label: "Customers", href: "/dashboard/customers", icon: "Users" },
  inbox: { label: "Inbox", href: "/dashboard/inbox", icon: "Inbox" },
  leads: { label: "Leads", href: "/dashboard/customers", icon: "Target" },
  payments: { label: "Payments", href: "/dashboard/orders", icon: "CreditCard" },
  knowledge: { label: "Business Info", href: "/dashboard/knowledge", icon: "BookOpen" },
  ai_assistant: { label: "AI Assistant", href: "/dashboard/copilot", icon: "Bot" },
  automations: { label: "Smart Rules", href: "/dashboard/automations", icon: "Zap" },
  insights: { label: "Insights", href: "/dashboard/insights", icon: "Lightbulb" },
  importer: { label: "Import Data", href: "/dashboard/importer", icon: "Upload" },
};

export const STATIC_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "Home" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
  { label: "Activity", href: "/dashboard/activity", icon: "BarChart3" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

export function getNavigationForCapabilities(enabledModules: Capability[]) {
  const primary = enabledModules
    .filter((c) => c !== "knowledge" && c !== "ai_assistant" && c !== "automations" && c !== "importer")
    .map((c) => NAV_ITEMS[c])
    .filter(Boolean);

  const setup = ["importer", "knowledge"]
    .filter((c) => enabledModules.includes(c as Capability))
    .map((c) => NAV_ITEMS[c as Capability]);

  const advanced = ["automations", "ai_assistant"]
    .filter((c) => enabledModules.includes(c as Capability))
    .map((c) => NAV_ITEMS[c as Capability]);

  const seen = new Set<string>();
  const deduped = [...primary, ...STATIC_NAV_ITEMS, ...setup, ...advanced].filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });

  return deduped;
}

export const DASHBOARD_WIDGETS: Record<string, string[]> = {
  restaurant: ["today_orders", "today_bookings", "popular_products", "revenue", "recent_enquiries"],
  cafe: ["today_orders", "today_bookings", "popular_products", "revenue", "recent_enquiries"],
  bakery: ["today_orders", "popular_products", "revenue", "recent_enquiries"],
  salon: ["today_bookings", "upcoming_appointments", "popular_services", "recent_enquiries"],
  barbershop: ["today_bookings", "upcoming_appointments", "popular_services", "recent_enquiries"],
  clinic: ["today_bookings", "upcoming_appointments", "recent_enquiries"],
  retail: ["today_orders", "popular_products", "revenue", "inventory_alerts", "recent_enquiries"],
  ecommerce: ["today_orders", "popular_products", "revenue", "recent_enquiries"],
  agency: ["leads", "recent_enquiries", "revenue"],
  freelancer: ["leads", "recent_enquiries"],
  consultant: ["today_bookings", "leads", "recent_enquiries"],
  education: ["today_bookings", "upcoming_appointments", "recent_enquiries"],
  real_estate: ["leads", "popular_products", "recent_enquiries"],
  service_business: ["today_bookings", "upcoming_appointments", "recent_enquiries", "revenue"],
  portfolio: ["recent_enquiries"],
  other: ["recent_enquiries"],
};
