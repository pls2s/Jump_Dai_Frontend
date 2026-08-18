import { notificationFixtures } from "@/data/mock/notifications";
import { getAuthSession, type AuthSession } from "@/features/auth/lib/auth-session";
import { readNotificationIds, writeNotificationIds } from "@/features/notifications/lib/notification-store";
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
    throw new NotificationServiceError("Notifications aren’t connected for API mode yet. No notification request was sent.");
  }
  if (previewState === "error") throw new NotificationServiceError("Notifications couldn’t be loaded. Your read status is safe.");
  await demoDelay(220);
  const audience = notificationAudienceFor(session);
  const readIds = readNotificationIds(session.user.id, audience);
  const definitions = previewState === "empty" ? [] : notificationFixtures.filter((item) => item.audience === audience);
  const items = definitions.map((item) => ({ ...item, read: readIds.has(item.id) }));
  return { audience, items, unreadCount: items.filter((item) => !item.read).length };
}

export function markNotificationRead(notificationId: string) {
  const session = getAuthSession();
  if (!session || !shouldUseFrontendMocks) return false;
  const audience = notificationAudienceFor(session);
  const readIds = readNotificationIds(session.user.id, audience);
  readIds.add(notificationId);
  writeNotificationIds(session.user.id, audience, readIds);
  return true;
}

export function markEveryNotificationRead(notificationIds: string[]) {
  const session = getAuthSession();
  if (!session || !shouldUseFrontendMocks) return false;
  const audience = notificationAudienceFor(session);
  const readIds = readNotificationIds(session.user.id, audience);
  notificationIds.forEach((id) => readIds.add(id));
  writeNotificationIds(session.user.id, audience, readIds);
  return true;
}
