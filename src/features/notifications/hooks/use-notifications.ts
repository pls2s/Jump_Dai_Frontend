"use client";

import { useCallback, useEffect, useState } from "react";

import { NOTIFICATION_CHANGE_EVENT } from "@/features/notifications/lib/notification-store";
import { loadNotificationFeed, markEveryNotificationRead, markNotificationRead } from "@/features/notifications/services/notification-service";
import type { NotificationFeed, NotificationPreviewState } from "@/features/notifications/types";

export function useNotifications(previewState: NotificationPreviewState = "default") {
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (previewState === "loading") {
      setLoading(true);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setFeed(await loadNotificationFeed(previewState));
    } catch (caught) {
      setFeed(null);
      setError(caught instanceof Error ? caught.message : "Notifications couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [previewState]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const reload = () => void load();
    window.addEventListener(NOTIFICATION_CHANGE_EVENT, reload);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(NOTIFICATION_CHANGE_EVENT, reload);
    };
  }, [load]);

  function markRead(id: string) {
    if (!markNotificationRead(id)) return false;
    setFeed((current) => current ? { ...current, items: current.items.map((item) => item.id === id ? { ...item, read: true } : item), unreadCount: Math.max(0, current.unreadCount - (current.items.find((item) => item.id === id)?.read ? 0 : 1)) } : current);
    return true;
  }

  function markAllRead() {
    if (!feed || !markEveryNotificationRead(feed.items.map((item) => item.id))) return false;
    setFeed({ ...feed, items: feed.items.map((item) => ({ ...item, read: true })), unreadCount: 0 });
    return true;
  }

  return { feed, loading, error, retry: load, markRead, markAllRead };
}
