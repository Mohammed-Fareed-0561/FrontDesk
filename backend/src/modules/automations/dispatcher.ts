import { prisma } from "../../infrastructure/database/client.js";
import { processAutomation, SUPPORTED_TRIGGERS } from "./engine.js";
import { handleNotificationEvent } from "../notifications/handler.js";

/**
 * Dispatch a domain event to matching automations.
 * Called synchronously after DomainEvent creation.
 * For P0: in-process synchronous. Future: queue-based async.
 *
 * Returns the number of automations triggered.
 */
export async function dispatchEvent(eventId: string): Promise<number> {
  const event = await prisma.domainEvent.findUnique({ where: { id: eventId } });
  if (!event || !event.businessId) return 0;

  // Process notifications for supported events (regardless of automation match)
  // Reliability P0: await notification handler, record failures observably (audit), never throw to caller
  let payload: Record<string, any> = {};
  try { payload = JSON.parse(event.payload); } catch { payload = {}; }
  try {
    await handleNotificationEvent(event.businessId, event.eventType, payload, event.aggregateId || undefined);
  } catch (e: any) {
    // Handler already records NOTIFICATION_HANDLER_FAILED audit safely; this outer catch ensures
    // fire-and-forget is removed and failures are not silent. Never propagate to break originating operation.
    let raw = (e?.message || "unknown error").toString();
    raw = raw.replace(/sk-[a-zA-Z0-9]{10,}/g, "[REDACTED]");
    raw = raw.replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]");
    raw = raw.replace(/api[_-]?key\s*[:=]\s*[a-zA-Z0-9._-]+/gi, "api_key=[REDACTED]");
    const safeMsg = raw.slice(0, 200);
    console.error(`[dispatchEvent] notification handler failed for ${event.eventType}:`, safeMsg);
    try {
      const { prisma: auditPrisma } = await import("../../infrastructure/database/client.js");
      await auditPrisma.auditLog.create({
        data: {
          businessId: event.businessId,
          actorType: "system",
          action: "NOTIFICATION_HANDLER_FAILED",
          entityType: "notification",
          entityId: event.aggregateId || null,
          metadata: JSON.stringify({ eventType: event.eventType, error: safeMsg }),
        },
      });
    } catch {
      // Audit failure must not break dispatch
    }
  }

  // Only process supported trigger events
  if (!SUPPORTED_TRIGGERS.has(event.eventType)) return 0;

  // Find all active automations for this business with matching trigger
  const automations = await prisma.automation.findMany({
    where: {
      businessId: event.businessId,
      status: "active",
    },
  });

  let triggered = 0;
  for (const auto of automations) {
    // Check if this automation's trigger matches the event
    let trigger: any = {};
    try { trigger = JSON.parse(auto.triggerConfig || "{}"); } catch { trigger = {}; }

    if (trigger.eventType && trigger.eventType !== event.eventType) continue;

    // Process the automation
    const result = await processAutomation(auto.id, eventId);
    if (result.status === "completed" || result.status === "pending") {
      triggered++;
    }
  }

  return triggered;
}

/**
 * Process an automation manually (for testing/manual trigger).
 * Bypasses trigger matching — directly processes the automation.
 */
export async function triggerManual(
  automationId: string,
  businessId: string
): Promise<{ runId: string; status: string; error?: string }> {
  const automation = await prisma.automation.findUnique({ where: { id: automationId } });
  if (!automation) return { runId: "", status: "failed", error: "Automation not found" };
  if (automation.businessId !== businessId) return { runId: "", status: "failed", error: "Cross-tenant access denied" };
  if (automation.status !== "active") return { runId: "", status: "failed", error: "Automation not active" };

  // Create a synthetic event for manual trigger
  const event = await prisma.domainEvent.create({
    data: {
      businessId,
      eventType: "MANUAL_TRIGGER",
      aggregateType: "automation",
      aggregateId: automationId,
      payload: JSON.stringify({ automationId, manual: true }),
    },
  });

  return processAutomation(automationId, event.id);
}
