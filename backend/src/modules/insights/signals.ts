import { BusinessContext } from "./context.js";

export interface Signal {
  insightType: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  evidence: string; // JSON string
  source: "deterministic";
}

/**
 * Detect deterministic business signals from structured context.
 * Pure function — no database access, no AI calls.
 * All signals are tenant-scoped via the businessId in context.
 */
export function detectSignals(ctx: BusinessContext): Signal[] {
  const signals: Signal[] = [];

  // SALES_DROP: orders last7 vs prev7 drop >30%
  if (ctx.orders.prev7 > 0) {
    const change = ((ctx.orders.last7 - ctx.orders.prev7) / ctx.orders.prev7) * 100;
    if (change <= -30) {
      signals.push({
        insightType: "SALES_DROP",
        severity: change <= -50 ? "HIGH" : "MEDIUM",
        title: `Sales dropped ${Math.abs(change).toFixed(1)}%`,
        description: `Orders decreased from ${ctx.orders.prev7} to ${ctx.orders.last7} in the last 7 days vs previous 7 days.`,
        evidence: JSON.stringify({
          ordersPrev7: ctx.orders.prev7,
          ordersLast7: ctx.orders.last7,
          change: change.toFixed(1),
          totalPrev7: ctx.orders.totalPrev7,
          totalLast7: ctx.orders.totalLast7,
          window: "7d",
        }),
        source: "deterministic",
      });
    }
  }

  // ENQUIRY_BACKLOG: open enquiries >= 5
  if (ctx.enquiries.open >= 5) {
    signals.push({
      insightType: "ENQUIRY_BACKLOG",
      severity: ctx.enquiries.open >= 10 ? "HIGH" : "MEDIUM",
      title: `${ctx.enquiries.open} enquiries need attention`,
      description: `${ctx.enquiries.open} enquiries are in new/open/waiting status.`,
      evidence: JSON.stringify({ openEnquiries: ctx.enquiries.open }),
      source: "deterministic",
    });
  }

  // BOOKING_CANCELLATION_SPIKE: 3+ cancellations today
  if (ctx.bookings.cancelledToday >= 3) {
    signals.push({
      insightType: "BOOKING_CANCELLATION_SPIKE",
      severity: "MEDIUM",
      title: `${ctx.bookings.cancelledToday} bookings cancelled today`,
      description: `Above normal range (3+ cancellations in a single day).`,
      evidence: JSON.stringify({ cancelledToday: ctx.bookings.cancelledToday }),
      source: "deterministic",
    });
  }

  // LOW_CONVERSION: many enquiries but no orders
  if (ctx.enquiries.open >= 5 && ctx.orders.last7 === 0) {
    signals.push({
      insightType: "LOW_CONVERSION",
      severity: "MEDIUM",
      title: "Low conversion: enquiries without orders",
      description: `${ctx.enquiries.open} open enquiries but 0 orders in the last 7 days.`,
      evidence: JSON.stringify({ openEnquiries: ctx.enquiries.open, ordersLast7: ctx.orders.last7 }),
      source: "deterministic",
    });
  }

  // PRODUCT_UNAVAILABLE: active products that are unavailable
  if (ctx.products.unavailable > 0) {
    signals.push({
      insightType: "PRODUCT_UNAVAILABLE",
      severity: ctx.products.unavailable >= 3 ? "HIGH" : "MEDIUM",
      title: `${ctx.products.unavailable} product(s) unavailable`,
      description: `${ctx.products.unavailable} active product(s) are marked as unavailable or out of stock.`,
      evidence: JSON.stringify({ unavailableCount: ctx.products.unavailable, activeProducts: ctx.products.active }),
      source: "deterministic",
    });
  }

  // CUSTOMER_INACTIVITY: customers not seen in 30+ days
  if (ctx.customers.total >= 5 && ctx.customers.inactive30d >= Math.ceil(ctx.customers.total * 0.3)) {
    signals.push({
      insightType: "CUSTOMER_INACTIVITY",
      severity: ctx.customers.inactive30d >= 10 ? "MEDIUM" : "LOW",
      title: `${ctx.customers.inactive30d} customers inactive for 30+ days`,
      description: `${ctx.customers.inactive30d} of ${ctx.customers.total} customers have not been seen in over 30 days. Consider a win-back approach.`,
      evidence: JSON.stringify({ inactiveCount: ctx.customers.inactive30d, totalCustomers: ctx.customers.total }),
      source: "deterministic",
    });
  }

  // OFFER_EXPIRY: active offers expiring today
  if (ctx.offers.expiringToday > 0) {
    signals.push({
      insightType: "OFFER_EXPIRY",
      severity: "MEDIUM",
      title: `${ctx.offers.expiringToday} offer(s) expiring today`,
      description: `${ctx.offers.expiringToday} active offer(s) expire at the end of today.`,
      evidence: JSON.stringify({ expiringToday: ctx.offers.expiringToday, activeOffers: ctx.offers.active }),
      source: "deterministic",
    });
  }

  // NOTE: WEBSITE_ACTIVITY_CHANGE is NOT IMPLEMENTABLE IN P0
  // Reason: No website analytics/pageview model exists in the schema.
  // The Website model tracks pages and sections but not traffic/visits.
  // This signal requires a future analytics event or pageview tracking model.

  return signals;
}
