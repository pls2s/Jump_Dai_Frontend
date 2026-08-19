"use client";

import { Award, Bell, BookOpenCheck, CheckCheck, ClipboardCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, useToast } from "@/components/ui";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import type { NotificationFilter, NotificationKind, NotificationPreviewState, SkillSyncNotification } from "@/features/notifications/types";
import { cn } from "@/lib/cn";

const previewStates: NotificationPreviewState[] = ["default", "empty", "loading", "error"];
const kindIcons: Record<NotificationKind, typeof Bell> = { course: BookOpenCheck, learning: GraduationCap, assessment: ClipboardCheck, credential: Award, organization: GraduationCap, platform: ShieldCheck };

function previewState(value: string | null): NotificationPreviewState {
  return previewStates.includes(value as NotificationPreviewState) ? value as NotificationPreviewState : "default";
}

function notificationFilter(value: string | null): NotificationFilter {
  return value === "unread" ? "unread" : "all";
}

export function NotificationWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const state = previewState(searchParams.get("state"));
  const filter = notificationFilter(searchParams.get("filter"));
  const { feed, loading, error, retry, markRead, markAllRead } = useNotifications(state);
  const visibleItems = feed?.items.filter((item) => filter === "all" || !item.read) ?? [];

  function updateQuery(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  function retryNotifications() {
    if (state === "error") {
      updateQuery({ state: null });
      return;
    }
    void retry();
  }

  async function markOneRead(id: string) {
    if (await markRead(id)) showToast({ tone: "success", title: "Notification marked as read" });
  }

  async function openNotification(item: SkillSyncNotification) {
    await markRead(item.id);
    router.push(item.destination);
  }

  async function markAll() {
    if (await markAllRead()) showToast({ tone: "success", title: "All notifications marked as read" });
  }

  return (
    <ContentContainer className="max-w-[88rem]">
      <PageHeader eyebrow="SkillSync updates" title="Notifications" description="Course, learning, assessment, credential, and workspace updates that lead to real SkillSync destinations." actions={feed && feed.unreadCount > 0 ? <Button variant="secondary" onClick={markAll}><CheckCheck className="size-4" aria-hidden="true" />Mark all as read</Button> : undefined} />
      {loading ? <LoadingState title="Loading notifications" description="Preparing updates for your current workspace…" /> : error ? <ErrorState title="Notifications unavailable" description={error} onRetry={retryNotifications} /> : !feed || feed.items.length === 0 ? <EmptyState title="You’re all caught up" description="New learning and course updates will appear here." icon={<Bell className="size-6" aria-hidden="true" />} /> : (
        <>
          <div className="mt-7 flex flex-wrap items-center gap-2" aria-label="Notification filters">
            <Button variant={filter === "all" ? "primary" : "secondary"} size="sm" aria-pressed={filter === "all"} onClick={() => updateQuery({ filter: null })}>All</Button>
            <Button variant={filter === "unread" ? "primary" : "secondary"} size="sm" aria-pressed={filter === "unread"} onClick={() => updateQuery({ filter: "unread" })}>Unread <span aria-hidden="true">({feed.unreadCount})</span><span className="sr-only">, {feed.unreadCount} notifications</span></Button>
          </div>
          {visibleItems.length === 0 ? <EmptyState title="You’re all caught up" description="There are no unread notifications. You can still review previous updates under All." icon={<CheckCheck className="size-6" aria-hidden="true" />} /> : <ol className="mt-6 grid gap-3">{visibleItems.map((item) => <NotificationItem key={item.id} item={item} onMarkRead={() => void markOneRead(item.id)} onOpen={() => void openNotification(item)} />)}</ol>}
        </>
      )}
    </ContentContainer>
  );
}

function NotificationItem({ item, onMarkRead, onOpen }: { item: SkillSyncNotification; onMarkRead: () => void; onOpen: () => void }) {
  const Icon = kindIcons[item.kind];
  return (
    <li>
      <Card className={cn("p-5 sm:p-6", !item.read && "border-blue-200 bg-blue-50/45")}>
        <div className="flex items-start gap-4">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", item.read ? "bg-neutral-100 text-text-secondary" : "bg-blue-100 text-blue-700")}><Icon className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text-primary">{item.title}</h2>{!item.read && <Badge variant="info">Unread</Badge>}</div><time dateTime={item.createdAt} className="type-caption text-text-tertiary">{formatNotificationDate(item.createdAt)}</time></div>
            <p className="type-body-small mt-2 text-text-secondary">{item.message}</p>
            <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={onOpen}>Open update</Button>{!item.read && <Button variant="ghost" size="sm" onClick={onMarkRead}>Mark as read</Button>}</div>
          </div>
        </div>
      </Card>
    </li>
  );
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
