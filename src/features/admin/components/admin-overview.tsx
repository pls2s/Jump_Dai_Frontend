"use client";

import { BookOpen, Building2, LogOut, ShieldCheck, UserCog, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card } from "@/components/ui";
import { clearAuthSession } from "@/features/auth/lib/auth-session";
import { AdminEmpty, AdminError, AdminLoading } from "@/features/admin/components/admin-states";
import { adminPreviewState, useAdminSnapshot } from "@/features/admin/hooks/use-admin-snapshot";
import type { CourseLifecycleStatus } from "@/types/product";

const statusLabels: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "In review", published: "Published", unpublished: "Unpublished" };
const statusVariants: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = { draft: "neutral", review: "warning", published: "success", unpublished: "info" };

export function AdminOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot, loading, error, retry } = useAdminSnapshot(adminPreviewState(searchParams.get("state")));

  function signOut() {
    clearAuthSession();
    router.push("/sign-in?signedOut=1");
  }

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Platform administration" title="Admin overview" description="Inspect SkillSync accounts, course lifecycle, and recent platform activity without changing Creator or learner content." actions={<Button variant="ghost" onClick={signOut}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>} />
      {loading ? <AdminLoading /> : error || !snapshot ? <AdminError message={error} onRetry={retry} /> : snapshot.users.length === 0 && snapshot.courses.length === 0 ? <AdminEmpty title="No platform records yet" description="Users, courses, and oversight activity will appear here when the platform has data." /> : (
        <>
          <section className="mt-8" aria-labelledby="admin-metrics-heading">
            <div className="mb-4"><h2 id="admin-metrics-heading" className="type-title-large">Platform summary</h2><p className="type-body-small mt-1 text-text-secondary">Coherent counts derived from the current frontend fixtures.</p></div>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={Users} label="Total users" value={snapshot.totals.totalUsers} helper={`${snapshot.totals.learners} learners`} />
              <Metric icon={UserCog} label="Creators" value={snapshot.totals.creators} helper={`${snapshot.totals.admins} system Admin`} />
              <Metric icon={Building2} label="Organizations" value={snapshot.totals.organizations} helper="Workspace accounts" />
              <Metric icon={BookOpen} label="Published courses" value={snapshot.totals.publishedCourses} helper={`${snapshot.totals.totalCourses} total courses`} />
            </dl>
          </section>

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
            <section aria-labelledby="admin-course-status-heading">
              <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="admin-course-status-heading" className="type-title-large">Course oversight</h2><p className="type-body-small mt-1 text-text-secondary">Existing lifecycle states across the platform.</p></div><ButtonLink href="/admin/courses" variant="ghost" size="sm">View courses</ButtonLink></div>
              <Card className="divide-y divide-border-default">
                {snapshot.courses.slice(0, 5).map((course) => <div key={course.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant={statusVariants[course.status]}>{statusLabels[course.status]}</Badge><span className="type-caption text-text-tertiary">{course.ownerName}</span></div><h3 className="mt-2 font-semibold text-text-primary">{course.title}</h3></div><ButtonLink href={`/admin/courses/${course.id}`} variant="secondary" size="sm">Inspect course</ButtonLink></div>)}
              </Card>
            </section>

            <section aria-labelledby="admin-activity-heading">
              <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="admin-activity-heading" className="type-title-large">Recent activity</h2><p className="type-body-small mt-1 text-text-secondary">A lightweight oversight feed, not a security audit log.</p></div><ButtonLink href="/admin/activity" variant="ghost" size="sm">View all</ButtonLink></div>
              <Card className="divide-y divide-border-default">
                {snapshot.activity.slice(0, 4).map((item) => <div key={item.id} className="p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-action-primary" aria-hidden="true" /><div><h3 className="font-semibold text-text-primary">{item.title}</h3><p className="type-body-small mt-1 text-text-secondary">{item.description}</p><p className="type-caption mt-2 text-text-tertiary">{item.occurredAt}</p></div></div></div>)}
              </Card>
            </section>
          </div>
        </>
      )}
    </ContentContainer>
  );
}

function Metric({ icon: Icon, label, value, helper }: { icon: typeof Users; label: string; value: number; helper: string }) {
  return <Card className="p-5"><dt className="flex items-center gap-2 text-sm font-medium text-text-secondary"><Icon className="size-4 text-action-primary" aria-hidden="true" />{label}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{value}</dd><p className="type-caption mt-2 text-text-tertiary">{helper}</p></Card>;
}
