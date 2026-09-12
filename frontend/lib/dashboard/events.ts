/**
 * UX-IMPLEMENTATION-02
 * Translates raw domain event types into business-readable sentences.
 * No fake data — only events that exist in the domain event log.
 */

type EventContext = {
  /** Customer name if available (from enriched event payload, optional) */
  customerName?: string | null;
};

type HumanizedEvent = {
  label: string;
  /** Lucide icon name string */
  icon: string;
  /** Semantic colour class */
  colour: string;
};

const EVENT_MAP: Record<string, (ctx: EventContext) => HumanizedEvent> = {
  // Orders
  ORDER_CREATED: () => ({
    label: "New order placed",
    icon: "ShoppingBag",
    colour: "text-blue-500",
  }),
  ORDER_CONFIRMED: () => ({
    label: "Order confirmed",
    icon: "CheckCircle2",
    colour: "text-green-500",
  }),
  ORDER_COMPLETED: () => ({
    label: "Order completed",
    icon: "CheckCircle2",
    colour: "text-green-600",
  }),
  ORDER_CANCELLED: () => ({
    label: "Order cancelled",
    icon: "XCircle",
    colour: "text-red-500",
  }),
  ORDER_PAYMENT_UPDATED: () => ({
    label: "Payment updated",
    icon: "CreditCard",
    colour: "text-emerald-500",
  }),

  // Bookings
  BOOKING_CREATED: (ctx) => ({
    label: ctx.customerName
      ? `Booking received from ${ctx.customerName}`
      : "New booking received",
    icon: "Calendar",
    colour: "text-purple-500",
  }),
  BOOKING_CONFIRMED: (ctx) => ({
    label: ctx.customerName
      ? `Booking confirmed for ${ctx.customerName}`
      : "Booking confirmed",
    icon: "CalendarCheck",
    colour: "text-green-500",
  }),
  BOOKING_COMPLETED: (ctx) => ({
    label: ctx.customerName
      ? `Appointment completed — ${ctx.customerName}`
      : "Appointment completed",
    icon: "CalendarCheck2",
    colour: "text-green-600",
  }),
  BOOKING_CANCELLED: (ctx) => ({
    label: ctx.customerName
      ? `Booking cancelled — ${ctx.customerName}`
      : "Booking cancelled",
    icon: "CalendarX",
    colour: "text-red-500",
  }),
  BOOKING_NO_SHOW: (ctx) => ({
    label: ctx.customerName
      ? `No-show — ${ctx.customerName}`
      : "Customer no-show",
    icon: "UserX",
    colour: "text-orange-500",
  }),

  // Enquiries
  ENQUIRY_RECEIVED: (ctx) => ({
    label: ctx.customerName
      ? `Enquiry from ${ctx.customerName}`
      : "New enquiry received",
    icon: "MessageSquare",
    colour: "text-sky-500",
  }),
  ENQUIRY_RESOLVED: () => ({
    label: "Enquiry resolved",
    icon: "MessageSquareCheck",
    colour: "text-green-500",
  }),

  // Customers
  CUSTOMER_CREATED: (ctx) => ({
    label: ctx.customerName
      ? `New customer — ${ctx.customerName}`
      : "New customer added",
    icon: "UserPlus",
    colour: "text-teal-500",
  }),

  // Products / Catalog
  PRODUCT_CREATED: () => ({
    label: "Product added to catalog",
    icon: "Package",
    colour: "text-indigo-500",
  }),
  PRODUCT_UPDATED: () => ({
    label: "Product updated",
    icon: "PackageOpen",
    colour: "text-slate-500",
  }),

  // Website
  WEBSITE_PUBLISHED: () => ({
    label: "Website published",
    icon: "Globe",
    colour: "text-green-600",
  }),
  WEBSITE_UPDATED: () => ({
    label: "Website updated",
    icon: "Globe",
    colour: "text-blue-500",
  }),

  // Payments
  PAYMENT_RECEIVED: () => ({
    label: "Payment received",
    icon: "Banknote",
    colour: "text-emerald-500",
  }),
};

export function humanizeEvent(
  eventType: string,
  ctx: EventContext = {}
): HumanizedEvent {
  const factory = EVENT_MAP[eventType];
  if (factory) return factory(ctx);

  // Graceful fallback — still readable, still no raw identifiers exposed
  const readable = eventType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
  return {
    label: readable,
    icon: "Activity",
    colour: "text-muted-foreground",
  };
}

export function isKnownEvent(eventType: string): boolean {
  return eventType in EVENT_MAP;
}
