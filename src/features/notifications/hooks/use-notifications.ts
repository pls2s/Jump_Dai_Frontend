"use client";

import { useCallback, useEffect, useState } from "react";

import { NOTIFICATION_CHANGE_EVENT } from "@/features/notifications/lib/notification-store";
import { loadNotificationFeed, markEveryNotificationRead, markNotificationRead } from "@/features/notifications/services/notification-service";
import type { NotificationFeed, NotificationPreviewState } from "@/features/notifications/types";
import { shouldUseFrontendMocks } from "@/lib/config";

export function useNotifications(previewState: NotificationPreviewState = "default") {
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (shouldUseFrontendMocks && previewState === "loading") {
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

  async function markRead(id: string) {
    try {
      const nextFeed = await markNotificationRead(id);
      if (!nextFeed) return false;
      setFeed(nextFeed);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The notification could not be marked as read.");
      return false;
    }
  }

  async function markAllRead() {
    if (!feed) return false;
    try {
      const nextFeed = await markEveryNotificationRead(feed.items.map((item) => item.id));
      if (!nextFeed) return false;
      setFeed(nextFeed);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Notifications could not be marked as read.");
      return false;
    }
  }

  return { feed, loading, error, retry: load, markRead, markAllRead };
}
