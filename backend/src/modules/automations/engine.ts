import { prisma } from "../../infrastructure/database/client.js";

// ── Supported P0 trigger event types ──
export const SUPPORTED_TRIGGERS = new Set([
  "ENQUIRY_CREATED",
  "ORDER_CREATED",
  "ORDER_COMPLETED",
  "ORDER_CONFIRMED",
  "ORDER_CANCELLED",
  "PAYMENT_CREATED",
  "PAYMENT_PAID",
  "BOOKING_CREATED",
  "BOOKING_COMPLETED",
  "BOOKING_CANCELLED",
  "INSIGHT_CREATED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "MEMORY_CREATED",
]);

// ── Supported P0 action types (must map to ActionDefinition.actionKey) ──
export const SAFE_ACTIONS = new Set([
  "CREATE_PRODUCT",
  "CREATE_OFFER",
  "CREATE_NOTIFICATION",
]);

// Actions that require approval — maps to ActionDefinition.approvalRequired
const ACTIONS_REQUIRING_APPROVAL = new Set([
  "UPDATE_PRODUCT",
  "DELETE_PRODUCT",
]);

// ── Condition evaluator ──
// Supports simple deterministic conditions only. No arbitrary code execution.

interface Condition {
  field: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";
  value: any;
}

/**
 * Evaluate a list of conditions against an event payload + business context.
 * All conditions must pass (AND logic).
 * Returns { passed: boolean, reason?: string }.
 */
export function evaluateConditions(
  conditions: Condition[] | null | undefined,
  eventPayload: Record<string, any>,
  businessContext?: Record<string, any>
): { passed: boolean; reason?: string } {
  if (!conditions || conditions.length === 0) return { passed: true };

  const data = { ...eventPayload, ...(businessContext || {}) };

  for (const cond of conditions) {
    const fieldValue = data[cond.field];
    if (fieldValue === undefined) {
      return { passed: false, reason: `Field '${cond.field}' not available in event data` };
    }

    let result = false;
    switch (cond.op) {
      case "eq": result = fieldValue === cond.value; break;
      case "neq": result = fieldValue !== cond.value; break;
      case "gt": result = Number(fieldValue) > Number(cond.value); break;
      case "gte": result = Number(fieldValue) >= Number(cond.value); break;
      case "lt": result = Number(fieldValue) < Number(cond.value); break;
      case "lte": result = Number(fieldValue) <= Number(cond.value); break;
      case "contains": result = String(fieldValue).toLowerCase().includes(String(cond.value).toLowerCase()); break;
      default:
        return { passed: false, reason: `Unknown operator '${cond.op}'` };
    }

    if (!result) {
      return { passed: false, reason: `${cond.field} ${cond.op} ${cond.value} (got ${fieldValue})` };
    }
  }

  return { passed: true };
}

/**
 * Validate that an automation configuration is safe.
 * Rejects arbitrary code execution, shell commands, etc.
 */
export function validateAutomationConfig(config: {
  triggerConfig?: string | null;
  conditionsConfig?: string | null;
  actionsConfig?: string | null;
}): { valid: boolean; error?: string } {
  // Validate trigger config
  if (config.triggerConfig) {
    let trigger: any;
    try { trigger = JSON.parse(config.triggerConfig); } catch {
      return { valid: false, error: "Invalid trigger configuration JSON" };
    }
    if (!trigger.eventType || typeof trigger.eventType !== "string") {
      return { valid: false, error: "Trigger must have an eventType string" };
    }
    if (!SUPPORTED_TRIGGERS.has(trigger.eventType)) {
      return { valid: false, error: `Unsupported trigger event: ${trigger.eventType}. Supported: ${[...SUPPORTED_TRIGGERS].join(", ")}` };
    }
    // Security: reject dangerous fields
    const dangerous = ["exec", "eval", "Function", "require", "import", "spawn", "shell", "system", "__proto__"];
    const triggerStr = JSON.stringify(trigger).toLowerCase();
    for (const d of dangerous) {
      if (triggerStr.includes(d.toLowerCase())) {
        return { valid: false, error: `Trigger configuration contains prohibited pattern: ${d}` };
      }
    }
  }

  // Validate conditions config
  if (config.conditionsConfig) {
    let conditions: any;
    try { conditions = JSON.parse(config.conditionsConfig); } catch {
      return { valid: false, error: "Invalid conditions configuration JSON" };
    }
    if (!Array.isArray(conditions)) {
      return { valid: false, error: "Conditions must be an array" };
    }
    for (const cond of conditions) {
      if (!cond.field || !cond.op || !("value" in cond)) {
        return { valid: false, error: "Each condition must have field, op, and value" };
      }
      if (!["eq", "neq", "gt", "gte", "lt", "lte", "contains"].includes(cond.op)) {
        return { valid: false, error: `Invalid condition operator: ${cond.op}` };
      }
    }
    // Security: reject dangerous patterns
    const condStr = JSON.stringify(conditions).toLowerCase();
    for (const d of ["exec", "eval", "Function", "require", "shell", "system", "__proto__"]) {
      if (condStr.includes(d.toLowerCase())) {
        return { valid: false, error: `Conditions contain prohibited pattern: ${d}` };
      }
    }
  }

  // Validate actions config
  if (config.actionsConfig) {
    let actions: any;
    try { actions = JSON.parse(config.actionsConfig); } catch {
      return { valid: false, error: "Invalid actions configuration JSON" };
    }
    if (!Array.isArray(actions)) {
      return { valid: false, error: "Actions must be an array" };
    }
    for (const act of actions) {
      if (!act.actionKey || typeof act.actionKey !== "string") {
        return { valid: false, error: "Each action must have an actionKey string" };
      }
      // Security: reject dangerous patterns
      const actStr = JSON.stringify(act).toLowerCase();
      for (const d of ["exec", "eval", "Function", "require", "shell", "system", "__proto__", "fetch", "http"]) {
        if (actStr.includes(d.toLowerCase())) {
          return { valid: false, error: `Action configuration contains prohibited pattern: ${d}` };
        }
      }
    }
  }

  return { valid: true };
}

/**
 * Process a single automation against a domain event.
 * Returns the AutomationRun result.
 */
export async function processAutomation(
  automationId: string,
  eventId: string
): Promise<{ runId: string; status: string; error?: string }> {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
  if (!automation) return { runId: "", status: "failed", error: "Automation not found" };
  if (automation.status !== "active") return { runId: "", status: "skipped", error: "Automation not active" };

  const event = await prisma.domainEvent.findUnique({ where: { id: eventId } });
  if (!event) return { runId: "", status: "failed", error: "Event not found" };

  // Verify event belongs to the same business
  if (event.businessId !== automation.businessId) {
    return { runId: "", status: "failed", error: "Cross-tenant event rejected" };
  }

  // Check idempotency: skip if this event already triggered this automation
  const existingRun = await prisma.automationRun.findFirst({
    where: { automationId, triggerEventId: eventId, status: { in: ["completed", "running", "pending"] } },
  });
  if (existingRun) {
    return { runId: existingRun.id, status: "skipped", error: "Already processed" };
  }

  // Parse event payload
  let eventPayload: Record<string, any> = {};
  try { eventPayload = JSON.parse(event.payload); } catch { eventPayload = {}; }
  eventPayload.eventType = event.eventType;
  eventPayload.aggregateType = event.aggregateType;
  eventPayload.aggregateId = event.aggregateId;

  // Evaluate trigger (skip check for manual triggers)
  let trigger: any = {};
  try { trigger = JSON.parse(automation.triggerConfig || "{}"); } catch { trigger = {}; }
  if (event.eventType !== "MANUAL_TRIGGER" && trigger.eventType && trigger.eventType !== event.eventType) {
    return { runId: "", status: "skipped", error: "Trigger mismatch" };
  }

  // Evaluate conditions
  let conditions: Condition[] = [];
  try { conditions = JSON.parse(automation.conditionsConfig || "[]"); } catch { conditions = []; }
  const condResult = evaluateConditions(conditions, eventPayload);
  if (!condResult.passed) {
    return { runId: "", status: "skipped", error: `Condition not met: ${condResult.reason}` };
  }

  // Create run
  const run = await prisma.automationRun.create({
    data: {
      automationId,
      triggerEventId: eventId,
      status: "running",
      startedAt: new Date(),
      executionContext: JSON.stringify({ eventPayload, conditions: condResult }),
    },
  });

  // Execute actions
  let actions: any[] = [];
  try { actions = JSON.parse(automation.actionsConfig || "[]"); } catch { actions = []; }

  try {
    for (const act of actions) {
      const actionKey = act.actionKey;
      if (!actionKey) continue;

      // Look up ActionDefinition
      let def = await prisma.actionDefinition.findUnique({ where: { actionKey } });
      if (!def) {
        // Auto-create if missing (safe for P0)
        def = await prisma.actionDefinition.create({
          data: { actionKey, name: actionKey, approvalRequired: ACTIONS_REQUIRING_APPROVAL.has(actionKey) },
        });
      }

      // Create ActionExecution
      const execution = await prisma.actionExecution.create({
        data: {
          businessId: automation.businessId,
          actionDefinitionId: def.id,
          requestedByType: "system",
          requestedById: automation.id,
          status: def.approvalRequired ? "pending" : "completed",
          inputPayload: JSON.stringify({ actionKey, params: act.params || {}, triggerEventId: eventId, automationId }),
        },
      });

      // If approval required, create ApprovalRequest
      if (def.approvalRequired) {
        await prisma.approvalRequest.create({
          data: {
            businessId: automation.businessId,
            actionExecutionId: execution.id,
            requestedByType: "system",
            requestedById: automation.id,
            status: "pending",
            reason: `Automation "${automation.name}" triggered action: ${actionKey}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } else {
        // Execute safe actions directly
        await executeAction(automation.businessId, actionKey, act.params || {}, execution.id);
      }

      // Audit
      await prisma.auditLog.create({
        data: {
          businessId: automation.businessId,
          actorType: "system",
          actorId: automation.createdBy,
          action: "AUTOMATION_ACTION_EXECUTED",
          entityType: "automation",
          entityId: automation.id,
          afterData: JSON.stringify({ actionKey, executionId: execution.id, approvalRequired: def.approvalRequired }),
        },
      });
    }

    // Mark run completed
    await prisma.automationRun.update({
      where: { id: run.id },
      data: { status: "completed", completedAt: new Date() },
    });

    // Audit
    await prisma.auditLog.create({
      data: {
        businessId: automation.businessId,
        actorType: "system",
        actorId: automation.createdBy,
        action: "AUTOMATION_RUN_COMPLETED",
        entityType: "automation_run",
        entityId: run.id,
      },
    });

    return { runId: run.id, status: "completed" };
  } catch (e: any) {
    await prisma.automationRun.update({
      where: { id: run.id },
      data: { status: "failed", completedAt: new Date(), errorMessage: e.message?.slice(0, 500) },
    });
    await prisma.auditLog.create({
      data: {
        businessId: automation.businessId,
        actorType: "system",
        actorId: automation.createdBy,
        action: "AUTOMATION_RUN_FAILED",
        entityType: "automation_run",
        entityId: run.id,
        afterData: JSON.stringify({ error: e.message?.slice(0, 200) }),
      },
    });
    return { runId: run.id, status: "failed", error: e.message };
  }
}

/**
 * Execute a safe action directly (non-approval-required actions).
 * Only actions in SAFE_ACTIONS are executed.
 */
async function executeAction(
  businessId: string,
  actionKey: string,
  params: Record<string, any>,
  executionId: string
): Promise<void> {
  switch (actionKey) {
    case "CREATE_PRODUCT": {
      const name = params.name || "Auto-created product";
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
      let finalSlug = slug;
      let i = 1;
      while (await prisma.product.findFirst({ where: { businessId, slug: finalSlug } })) finalSlug = `${slug}-${i++}`;
      await prisma.product.create({
        data: { businessId, name, slug: finalSlug, price: params.price || null, currency: "INR", status: "active" },
      });
      break;
    }
    case "CREATE_OFFER": {
      await prisma.offer.create({
        data: {
          businessId,
          name: params.name || "Auto-created offer",
          code: params.code || null,
          description: params.description || null,
          discountType: params.discountType || "percentage",
          discountValue: params.discountValue || 0,
          status: "active",
        },
      });
      break;
    }
    case "CREATE_NOTIFICATION": {
      const { createNotification } = await import("../notifications/service.js");
      await createNotification({
        businessId,
        type: params.type || "AUTOMATION",
        title: params.title || "Automation Notification",
        message: params.message || "",
        severity: params.severity || "info",
        sourceType: "automation",
        sourceId: executionId,
      });
      break;
    }
    default:
      // Unknown safe action — log but don't execute
      break;
  }
}
