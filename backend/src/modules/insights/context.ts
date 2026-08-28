import { prisma } from "../../infrastructure/database/client.js";

export interface BusinessContext {
  businessId: string;
  businessName: string;
  now: Date;
  orders: {
    last7: number;
    prev7: number;
    today: number;
    totalLast7: number;
    totalPrev7: number;
  };
  bookings: {
    today: number;
    last7: number;
    cancelledToday: number;
  };
  enquiries: {
    open: number;
    newToday: number;
  };
  products: {
    total: number;
    active: number;
    draft: number;
    unavailable: number;
  };
  customers: {
    total: number;
    inactive30d: number;
  };
  offers: {
    active: number;
    expiringToday: number;
  };
  timeWindow: {
    last7: Date;
    prev7: Date;
    todayStart: Date;
  };
}

/**
 * Build structured business context from the database.
 * All queries are tenant-scoped by businessId.
 */
export async function buildBusinessContext(businessId: string): Promise<BusinessContext> {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const last7 = new Date(now.getTime() - 7 * 24 * 3600000);
  const prev7 = new Date(last7.getTime() - 7 * 24 * 3600000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600000);

  const [
    business,
    ordersLast7,
    ordersPrev7,
    ordersToday,
    bookingsToday,
    bookingsLast7,
    bookingsCancelledToday,
    enquiriesOpen,
    enquiriesNewToday,
    products,
    customersTotal,
    customersInactive,
    offersActive,
    offersExpiringToday,
  ] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { name: true } }),
    prisma.order.findMany({ where: { businessId, createdAt: { gte: last7 } }, select: { totalAmount: true } }),
    prisma.order.findMany({ where: { businessId, createdAt: { gte: prev7, lt: last7 } }, select: { totalAmount: true } }),
    prisma.order.count({ where: { businessId, createdAt: { gte: todayStart } } }),
    prisma.booking.count({ where: { businessId, createdAt: { gte: todayStart } } }),
    prisma.booking.count({ where: { businessId, createdAt: { gte: last7 } } }),
    prisma.booking.count({ where: { businessId, status: "cancelled", createdAt: { gte: todayStart } } }),
    prisma.enquiry.count({ where: { businessId, status: { in: ["new", "open", "waiting"] } } }),
    prisma.enquiry.count({ where: { businessId, status: "new", createdAt: { gte: todayStart } } }),
    prisma.product.findMany({ where: { businessId, deletedAt: null }, select: { status: true, availability: true } }),
    prisma.customer.count({ where: { businessId, deletedAt: null } }),
    prisma.customer.count({ where: { businessId, deletedAt: null, lastSeenAt: { lt: thirtyDaysAgo } } }),
    prisma.offer.findMany({ where: { businessId, status: "active", deletedAt: null }, select: { expiresAt: true } }),
    prisma.offer.count({ where: { businessId, status: "active", deletedAt: null, expiresAt: { gte: todayStart, lt: new Date(todayStart.getTime() + 24 * 3600000) } } }),
  ]);

  const totalLast7 = ordersLast7.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalPrev7 = ordersPrev7.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return {
    businessId,
    businessName: business?.name || "",
    now,
    orders: {
      last7: ordersLast7.length,
      prev7: ordersPrev7.length,
      today: ordersToday,
      totalLast7,
      totalPrev7,
    },
    bookings: {
      today: bookingsToday,
      last7: bookingsLast7,
      cancelledToday: bookingsCancelledToday,
    },
    enquiries: {
      open: enquiriesOpen,
      newToday: enquiriesNewToday,
    },
    products: {
      total: products.length,
      active: products.filter(p => p.status === "active").length,
      draft: products.filter(p => p.status === "draft").length,
      unavailable: products.filter(p => p.status === "active" && p.availability !== "available").length,
    },
    customers: {
      total: customersTotal,
      inactive30d: customersInactive,
    },
    offers: {
      active: offersActive.length,
      expiringToday: offersExpiringToday,
    },
    timeWindow: { last7, prev7, todayStart },
  };
}
