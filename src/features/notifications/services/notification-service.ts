import { notificationFixtures } from "@/data/mock/notifications";
import { getAuthSession, type AuthSession } from "@/features/auth/lib/auth-session";
import { getApiNotificationFeed, markAllApiNotificationsRead, markApiNotificationRead } from "@/features/notifications/api/notifications-api";
import { NOTIFICATION_CHANGE_EVENT, readNotificationIds, writeNotificationIds } from "@/features/notifications/lib/notification-store";
import type { NotificationAudience, NotificationFeed, NotificationPreviewState } from "@/features/notifications/types";
import { shouldUseFrontendMocks } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";

export class NotificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

export function notificationAudienceFor(session: AuthSession): NotificationAudience {
  if (session.user.roles?.includes("admin")) return "admin";
  if (session.user.workspaceType === "organization") return "organization";
  if (session.user.workspaceType === "learner") return "learner";
  return "creator";
}

export async function loadNotificationFeed(previewState: NotificationPreviewState = "default"): Promise<NotificationFeed> {
  const session = getAuthSession();
  if (!session) throw new NotificationServiceError("Sign in to view SkillSync notifications.");
  if (!shouldUseFrontendMocks) {
    if (session.mode !== "api") throw new NotificationServiceError("Sign in again to load API notifications.");
    return getApiNotificationFeed(session.accessToken);
  }
  if (previewState === "error") throw new NotificationServiceError("Notifications couldn’t be loaded. Your read status is safe.");
  await demoDelay(220);
  const audience = notificationAudienceFor(session);
  const readIds = readNotificationIds(session.user.id, audience);
  const definitions = previewState === "empty" ? [] : notificationFixtures.filter((item) => item.audience === audience);
  const items = definitions.map((item) => ({ ...item, read: readIds.has(item.id) }));
  return { audience, items, unreadCount: items.filter((item) => !item.read).length };
}

function announceNotificationChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(NOTIFICATION_CHANGE_EVENT));
}

export async function markNotificationRead(notificationId: string): Promise<NotificationFeed | null> {
  const session = getAuthSession();
  if (!session) return null;
  if (!shouldUseFrontendMocks) {
    if (session.mode !== "api") return null;
    const feed = await markApiNotificationRead(session.accessToken, notificationId);
    announceNotificationChange();
    return feed;
  }
  const audience = notificationAudienceFor(session);
  const readIds = readNotificationIds(session.user.id, audience);
  readIds.add(notificationId);
  writeNotificationIds(session.user.id, audience, readIds);
  return loadNotificationFeed();
}

export async function markEveryNotificationRead(notificationIds: string[]): Promise<NotificationFeed | null> {
  const session = getAuthSession();
  if (!session) return null;
  if (!shouldUseFrontendMocks) {
    if (session.mode !== "api") return null;
    const feed = await markAllApiNotificationsRead(session.accessToken);
    announceNotificationChange();
    return feed;
  }
  const audience = notificationAudienceFor(session);
  const readIds = readNotificationIds(session.user.id, audience);
  notificationIds.forEach((id) => readIds.add(id));
  writeNotificationIds(session.user.id, audience, readIds);
  return loadNotificationFeed();
}
