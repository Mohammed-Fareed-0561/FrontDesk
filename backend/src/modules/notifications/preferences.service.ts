import { prisma } from "../../infrastructure/database/client.js";

/**
 * Supported notification types that can have preferences.
 * Must match the types used in handler.ts EVENT_HANDLERS.
 */
export const SUPPORTED_NOTIFICATION_TYPES = [
  "INSIGHT",
  "BOOKING",
  "ORDER",
  "PAYMENT",
  "SYSTEM",
  "AUTOMATION",
] as const;

export type SupportedNotificationType = (typeof SUPPORTED_NOTIFICATION_TYPES)[number];

export interface ListPreferencesInput {
  businessId: string;
  userId: string;
}

export interface UpsertPreferenceInput {
  businessId: string;
  userId: string;
  type: string;
  enabled: boolean;
}

/**
 * List all notification preferences for a user within a business.
 * Returns preferences for all supported types, creating default (enabled) rows on-the-fly
 * so the caller always sees a complete list.
 */
export async function listPreferences(input: ListPreferencesInput) {
  const { businessId, userId } = input;

  // Fetch existing preferences
  const existing = await prisma.notificationPreference.findMany({
    where: { businessId, userId },
  });

  const existingMap = new Map(existing.map((p) => [p.type, p]));

  // Ensure every supported type has a row (upsert defaults)
  const results = [];
  for (const type of SUPPORTED_NOTIFICATION_TYPES) {
    let pref = existingMap.get(type);
    if (!pref) {
      // Create default preference (enabled=true) lazily
      pref = await prisma.notificationPreference.upsert({
    where: {
      notif_pref_unique: { businessId, userId, type },
    },
    update: {},
    create: { businessId, userId, type, enabled: true },
      });
    }
    results.push(pref);
  }

  return results;
}

/**
 * Upsert (create or update) a notification preference.
 * Returns the updated preference.
 */
export async function upsertPreference(input: UpsertPreferenceInput) {
  const { businessId, userId, type, enabled } = input;

  const pref = await prisma.notificationPreference.upsert({
    where: {
      notif_pref_unique: { businessId, userId, type },
    },
    update: { enabled, updatedAt: new Date() },
    create: { businessId, userId, type, enabled },
  });

  return pref;
}

/**
 * Check if a notification type is enabled for a specific user within a business.
 * Returns true (enabled) by default if no preference row exists.
 * For broadcast notifications (no recipientId), preferences are not checked — always enabled.
 */
export async function isNotificationEnabled(
  businessId: string,
  userId: string | null | undefined,
  type: string
): Promise<boolean> {
  // Broadcast notifications (no recipient) are always enabled
  if (!userId || userId.length === 0) return true;

  const pref = await prisma.notificationPreference.findUnique({
    where: {
      notif_pref_unique: { businessId, userId, type },
    },
  });

  // No preference = enabled by default
  if (!pref) return true;

  return pref.enabled;
}
