import { createNotification } from "./service.js";
import { prisma } from "../../infrastructure/database/client.js";

/**
 * Map of event types to notification generators.
 * Each generator returns notification input or null to skip.
 */
const EVENT_HANDLERS: Record<
  string,
  (businessId: string, payload: Record<string, any>) => Promise<{
    type: string;
    title: string;
    message: string;
    severity: string;
    sourceType: string;
    sourceId: string;
  } | null>
> = {
  INSIGHT_CREATED: async (businessId, payload) => {
    const severity = payload.severity || "INFO";
    const insightType = payload.type || payload.insightType || "INSIGHT";
    const severityMap: Record<string, string> = {
      CRITICAL: "critical",
      HIGH: "high",
      MEDIUM: "medium",
      LOW: "low",
      INFO: "info",
    };
    return {
      type: "INSIGHT",
      title: `New Insight: ${insightType.replace(/_/g, " ")}`,
      message: `A new ${severity.toLowerCase()} priority insight has been detected.`,
      severity: severityMap[severity] || "info",
      sourceType: "insight",
      sourceId: payload.insightId || payload.aggregateId || "",
    };
  },

  BOOKING_CREATED: async (businessId, payload) => {
    return {
      type: "BOOKING",
      title: "New Booking",
      message: `Booking ${payload.bookingNumber || ""} has been created.`,
      severity: "info",
      sourceType: "booking",
      sourceId: payload.bookingId || payload.aggregateId || "",
    };
  },

  BOOKING_CANCELLED: async (businessId, payload) => {
    return {
      type: "BOOKING",
      title: "Booking Cancelled",
      message: `Booking ${payload.bookingNumber || ""} has been cancelled.`,
      severity: "medium",
      sourceType: "booking",
      sourceId: payload.bookingId || payload.aggregateId || "",
    };
  },

  PAYMENT_PAID: async (businessId, payload) => {
    return {
      type: "PAYMENT",
      title: "Payment Received",
      message: `Payment of ₹${payload.amount || ""} has been received.`,
      severity: "info",
      sourceType: "payment",
      sourceId: payload.paymentId || payload.aggregateId || "",
    };
  },

  ORDER_COMPLETED: async (businessId, payload) => {
    return {
      type: "ORDER",
      title: "Order Completed",
      message: `Order ${payload.orderNumber || ""} has been completed.`,
      severity: "info",
      sourceType: "order",
      sourceId: payload.orderId || payload.aggregateId || "",
    };
  },
};

/**
 * Handle a domain event and create notifications if applicable.
 * Called from the event dispatch pipeline.
 * Failures are logged but never thrown to avoid breaking event processing.
 */
export async function handleNotificationEvent(
  businessId: string,
  eventType: string,
  payload: Record<string, any>,
  aggregateId?: string
): Promise<boolean> {
  const handler = EVENT_HANDLERS[eventType];
  if (!handler) return false;

  try {
    const result = await handler(businessId, payload);
    if (!result) return false;

    await createNotification({
      businessId,
      recipientId: payload.recipientId || undefined,
      type: result.type,
      title: result.title,
      message: result.message,
      severity: result.severity,
      sourceType: result.sourceType,
      sourceId: result.sourceId || aggregateId || "",
    });

    return true;
  } catch (err: any) {
    // Record failure safely — no secrets, no stack traces in API responses
    // Sanitize error message: redact potential secrets (sk-, Bearer, api_key) and truncate
    let raw = err?.message?.toString() || "unknown error";
    // Redact common secret patterns
    raw = raw.replace(/sk-[a-zA-Z0-9]{10,}/g, "[REDACTED]");
    raw = raw.replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]");
    raw = raw.replace(/api[_-]?key\s*[:=]\s*[a-zA-Z0-9._-]+/gi, "api_key=[REDACTED]");
    const safeError = raw.slice(0, 200);
    try {
      await prisma.auditLog.create({
        data: {
          businessId,
          actorType: "system",
          action: "NOTIFICATION_HANDLER_FAILED",
          entityType: "notification",
          entityId: aggregateId || null,
          metadata: JSON.stringify({
            eventType,
            error: safeError,
          }),
        },
      });
    } catch {
      // If audit also fails, log to stderr — do not throw, sanitize as well
      console.error("[notification-handler] Failed to record audit for notification failure:", safeError);
    }
    // Notification failures must not break event processing
    return false;
  }
}
