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

export const ALL_BUSINESS_TYPES = [
  "restaurant", "cafe", "bakery", "salon", "barbershop",
  "clinic", "retail", "ecommerce", "agency", "freelancer",
  "consultant", "education", "real_estate", "service_business",
  "portfolio", "other",
];

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
    food: "restaurant", dine: "restaurant", dining: "restaurant",
    coffee: "cafe", coffee_shop: "cafe",
    pastry: "bakery", cake: "bakery",
    hair: "salon", beauty: "salon", spa: "salon", hair_salon: "salon",
    barber: "barbershop",
    medical: "clinic", doctor: "clinic", healthcare: "clinic",
    shop: "retail", store: "retail", boutique: "retail",
    online_store: "ecommerce", digital: "ecommerce",
    marketing: "agency", design: "agency", creative: "agency",
    dev: "freelancer", developer: "freelancer", photographer: "freelancer", writer: "freelancer",
    tutor: "education", school: "education", coaching: "education", training: "education",
    property: "real_estate", housing: "real_estate",
    plumbing: "service_business", electrician: "service_business", cleaning: "service_business",
    photography: "portfolio", personal: "portfolio",
  };
  return aliases[normalized] || "other";
}

export function validateCapabilities(capabilities: string[]): Capability[] {
  const valid = new Set<string>(ALL_CAPABILITIES);
  return capabilities.filter((c) => valid.has(c)) as Capability[];
}

export function mergeCapabilities(
  recommended: Capability[],
  enabled: Capability[],
  optional: Capability[]
): Capability[] {
  const allAvailable = new Set([...recommended, ...optional]);
  const validEnabled = enabled.filter((c) => allAvailable.has(c));
  const result = new Set([...recommended, ...validEnabled]);
  return [...result] as Capability[];
}
