import { prisma } from "../../infrastructure/database/client.js";
import { dispatchEvent } from "./dispatcher.js";

/**
 * Create a domain event and dispatch it to matching automations.
 * Use this instead of raw prisma.domainEvent.create in routes that
 * should trigger automations.
 */
export async function emitAndDispatch(data: {
  businessId: string;
  eventType: string;
  aggregateType?: string;
  aggregateId?: string;
  payload: string;
}): Promise<string> {
  const event = await prisma.domainEvent.create({ data });
  // Fire-and-forget dispatch (errors logged, not thrown)
  dispatchEvent(event.id).catch(() => {});
  return event.id;
}
