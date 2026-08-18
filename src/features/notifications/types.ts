export type NotificationAudience = "creator" | "learner" | "organization" | "admin";
export type NotificationKind = "course" | "learning" | "assessment" | "credential" | "organization" | "platform";
export type NotificationFilter = "all" | "unread";
export type NotificationPreviewState = "default" | "empty" | "loading" | "error";

export interface SkillSyncNotificationDefinition {
  id: string;
  audience: NotificationAudience;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  destination: string;
}

export interface SkillSyncNotification extends SkillSyncNotificationDefinition {
  read: boolean;
}

export interface NotificationFeed {
  audience: NotificationAudience;
  items: SkillSyncNotification[];
  unreadCount: number;
}
