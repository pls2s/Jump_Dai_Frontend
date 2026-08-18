"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, LogOut, Target, Users } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress } from "@/components/ui";
import { clearAuthSession, getAuthSession } from "@/features/auth/lib/auth-session";
import { organizationPreviewState, useOrganizationSnapshot } from "@/features/organization/hooks/use-organization-snapshot";
import { OrganizationEmpty, OrganizationError, OrganizationLoading } from "@/features/organization/components/organization-states";
import type { CourseLifecycleStatus } from "@/types/product";
import { useRouter, useSearchParams } from "next/navigation";

const statusLabel: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "In review", published: "Published", unpublished: "Unpublished" };
const statusVariant: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = { draft: "neutral", review: "warning", published: "success", unpublished: "info" };

export function OrganizationOverview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const previewState = organizationPreviewState(searchParams.get("state"));
  const { snapshot, loading, error, retry } = useOrganizationSnapshot({ timeRange: "30d", previewState });
  const [currentUser, setCurrentUser] = useState("Organization member");

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentUser(getAuthSession()?.user.name ?? "Organization member"), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function signOut() {
    clearAuthSession();
    router.push("/sign-in?signedOut=1");
  }

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Organization workspace" title={snapshot?.organization.name ?? "Organization Workspace"} description="Understand learning participation, course performance, and skill development across your workspace." actions={<Button variant="ghost" onClick={signOut}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>} />
      {loading ? <OrganizationLoading /> : error || !snapshot ? <OrganizationError message={error} onRetry={retry} /> : snapshot.courses.length === 0 ? <OrganizationEmpty /> : (
        <>
          <Card className="mt-7 flex flex-col gap-4 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="type-caption font-semibold tracking-wide text-blue-800 uppercase">Workspace context</p><p className="mt-1 font-semibold text-text-primary">{snapshot.organization.learningFocus}</p></div>
            <div className="type-body-small text-text-secondary sm:text-right"><span className="block">Current user</span><strong className="text-text-primary">{currentUser}</strong></div>
          </Card>

          <section className="mt-10" aria-labelledby="organization-overview-metrics">
            <div className="mb-4"><h2 id="organization-overview-metrics" className="type-title-large">Learning overview</h2><p className="type-body-small mt-1 text-text-secondary">Organization activity for the last 30 days.</p></div>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={BookOpen} label="Active courses" value={String(snapshot.totals.activeCourses)} detail="Published learning content" />
              <MetricCard icon={Users} label="Active learners" value={String(snapshot.totals.activeLearners)} detail="Participating in published courses" />
              <MetricCard icon={CheckCircle2} label="Completion rate" value={`${snapshot.totals.completionRate}%`} detail="Completed starts in view" />
              <MetricCard icon={Target} label="Verified skills" value={String(snapshot.totals.verifiedSkills)} detail="Evidence-backed skill records" />
            </dl>
          </section>

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
            <section aria-labelledby="organization-course-activity">
              <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="organization-course-activity" className="type-title-large">Course activity</h2><p className="type-body-small mt-1 text-text-secondary">Learning content associated with this workspace.</p></div><ButtonLink href="/organization/courses" variant="ghost" size="sm">View all<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>
              <div className="grid gap-3">
                {snapshot.courses.slice(0, 4).map((course) => {
                  const analytics = course.analytics;
                  return <Card key={course.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant={statusVariant[course.status]}>{statusLabel[course.status]}</Badge><span className="type-caption text-text-tertiary">Owner: {course.ownerName}</span></div><h3 className="mt-3 font-semibold text-text-primary">{course.title}</h3>{course.status === "published" && <p className="type-body-small mt-1 text-text-secondary">{analytics?.courseStarts ?? 0} starts · {analytics?.completionRate ?? 0}% completion</p>}</div><ButtonLink href={`/organization/courses/${course.id}`} variant="secondary" size="sm">{course.status === "published" ? "View performance" : "View course"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div></Card>;
                })}
              </div>
            </section>

            <section aria-labelledby="recent-organization-activity">
              <div className="mb-4"><h2 id="recent-organization-activity" className="type-title-large">Recent learning activity</h2><p className="type-body-small mt-1 text-text-secondary">Learning-only events from the demo workspace.</p></div>
              <Card className="divide-y divide-border-default">
                {snapshot.recentActivity.map((activity) => <div key={activity.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-text-primary">{activity.label}</p><p className="type-body-small mt-1 text-text-secondary">{activity.detail}</p></div><span className="type-caption shrink-0 text-text-tertiary">{activity.occurredAt}</span></div></div>)}
              </Card>
              <ButtonLink href="/organization/learners" variant="secondary" className="mt-4 w-full">View learners</ButtonLink>
            </section>
          </div>

          <section className="mt-10" aria-labelledby="organization-skill-preview">
            <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="organization-skill-preview" className="type-title-large">Skill development</h2><p className="type-body-small mt-1 text-text-secondary">Aggregate outcomes only—individual answers are not exposed.</p></div><ButtonLink href="/organization/skills" variant="ghost" size="sm">View all outcomes<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>
            <div className="grid gap-4 md:grid-cols-2">
              {snapshot.skills.slice(0, 4).map((skill) => <Card key={skill.skillId} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{skill.name}</h3><p className="type-caption mt-1 text-text-tertiary">{skill.learnerCount} learners · +{skill.improvement} average improvement</p></div><Badge variant={skill.coverage === "strong" ? "success" : skill.coverage === "needs-attention" ? "warning" : "info"}>{skill.coverage === "strong" ? "Strong coverage" : skill.coverage === "needs-attention" ? "Needs attention" : "Developing"}</Badge></div><Progress value={skill.postScore} label={`Post-learning average for ${skill.name}`} showValue size="sm" className="mt-4" /></Card>)}
            </div>
          </section>
        </>
      )}
    </ContentContainer>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof BookOpen; label: string; value: string; detail: string }) {
  return <Card className="p-5"><dt className="flex items-center gap-2 text-sm font-medium text-text-secondary"><Icon className="size-4 text-action-primary" aria-hidden="true" />{label}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{value}</dd><p className="type-caption mt-2 text-text-tertiary">{detail}</p></Card>;
}
