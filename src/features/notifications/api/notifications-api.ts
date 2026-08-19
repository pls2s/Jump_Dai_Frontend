import type { NotificationFeed, SkillSyncNotification } from "@/features/notifications/types";
import { apiRequest } from "@/lib/api/api-client";

interface ApiNotification {
  id: string;
  audience: SkillSyncNotification["audience"];
  kind: SkillSyncNotification["kind"];
  title: string;
  message: string;
  created_at: string;
  destination: string;
  read: boolean;
}

interface ApiNotificationFeed {
  audience: NotificationFeed["audience"];
  items: ApiNotification[];
  unread_count: number;
}

function mapFeed(feed: ApiNotificationFeed): NotificationFeed {
  return {
    audience: feed.audience,
    items: feed.items.map((item) => ({
      id: item.id,
      audience: item.audience,
      kind: item.kind,
      title: item.title,
      message: item.message,
      createdAt: item.created_at,
      destination: item.destination,
      read: item.read,
    })),
    unreadCount: feed.unread_count,
  };
}

/** Load the role-scoped notification feed for the API session. */
export async function getApiNotificationFeed(accessToken: string): Promise<NotificationFeed> {
  return mapFeed(await apiRequest<ApiNotificationFeed>("/api/notifications", {
    method: "GET",
    token: accessToken,
  }));
}

/** Persist one read receipt in the mock API and return the refreshed feed. */
export async function markApiNotificationRead(accessToken: string, notificationId: string): Promise<NotificationFeed> {
  return mapFeed(await apiRequest<ApiNotificationFeed>(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    token: accessToken,
  }));
}

/** Mark all notifications visible to the current API user as read. */
export async function markAllApiNotificationsRead(accessToken: string): Promise<NotificationFeed> {
  return mapFeed(await apiRequest<ApiNotificationFeed>("/api/notifications/read-all", {
    method: "POST",
    token: accessToken,
  }));
}
