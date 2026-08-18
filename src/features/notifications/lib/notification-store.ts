import type { NotificationAudience } from "@/features/notifications/types";

const STORAGE_PREFIX = "skillsync-notification-read";
export const NOTIFICATION_CHANGE_EVENT = "skillsync-notifications-changed";

function storageKey(userId: number, audience: NotificationAudience) {
  return `${STORAGE_PREFIX}:${userId}:${audience}`;
}

export function readNotificationIds(userId: number, audience: NotificationAudience) {
  if (typeof window === "undefined") return new Set<string>();
  const raw = localStorage.getItem(storageKey(userId, audience));
  if (!raw) return new Set<string>();
  try {
    const value = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(value) && value.every((item) => typeof item === "string") ? value : []);
  } catch {
    return new Set<string>();
  }
}

export function writeNotificationIds(userId: number, audience: NotificationAudience, ids: Iterable<string>) {
  localStorage.setItem(storageKey(userId, audience), JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new CustomEvent(NOTIFICATION_CHANGE_EVENT));
}
