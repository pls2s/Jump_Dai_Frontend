"use client";

import { Building2, BookOpenCheck, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Card, Field, FieldLabel, Select } from "@/components/ui";
import { AdminEmpty, AdminError, AdminLoading } from "@/features/admin/components/admin-states";
import { adminPreviewState, useAdminSnapshot } from "@/features/admin/hooks/use-admin-snapshot";
import type { AdminActivityType } from "@/features/admin/types";

const types: Array<AdminActivityType | "all"> = ["all", "course", "account", "organization"];
const labels: Record<AdminActivityType, string> = { course: "Course", account: "Account", organization: "Organization" };
const icons = { course: BookOpenCheck, account: UserRound, organization: Building2 };

export function AdminActivity() {
  const searchParams = useSearchParams();
  const { snapshot, loading, error, retry } = useAdminSnapshot(adminPreviewState(searchParams.get("state")));
  const [type, setType] = useState<AdminActivityType | "all">("all");
  const activity = snapshot?.activity.filter((item) => type === "all" || item.type === type) ?? [];
  return <ContentContainer className="max-w-[88rem]"><PageHeader eyebrow="Platform administration" title="Platform activity" description="Recent account, course, and organization events for lightweight oversight—not a security audit log." breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Platform activity" }]} />{loading ? <AdminLoading label="Loading platform activity" /> : error || !snapshot ? <AdminError message={error} onRetry={retry} /> : snapshot.activity.length === 0 ? <AdminEmpty title="No platform activity" description="Recent platform events will appear here when activity is available." /> : <><Card className="mt-7 max-w-sm p-4 sm:p-5"><Field><FieldLabel htmlFor="admin-activity-type">Activity type</FieldLabel><Select id="admin-activity-type" value={type} onChange={(event) => setType(event.target.value as AdminActivityType | "all")}>{types.map((item) => <option key={item} value={item}>{item === "all" ? "All activity" : labels[item]}</option>)}</Select></Field></Card>{activity.length === 0 ? <AdminEmpty title="No activity matches this filter" description="Choose another activity type to inspect recent platform events." /> : <ol className="mt-8 grid gap-3">{activity.map((item) => { const Icon = icons[item.type]; return <li key={item.id}><Card className="p-5"><div className="flex items-start gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Icon className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><Badge variant="info">{labels[item.type]}</Badge><h2 className="mt-2 font-semibold text-text-primary">{item.title}</h2></div><time className="type-caption text-text-tertiary">{item.occurredAt}</time></div><p className="type-body-small mt-2 text-text-secondary">{item.description}</p></div></div></Card></li>; })}</ol>}</>}</ContentContainer>;
}
