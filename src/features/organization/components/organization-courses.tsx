"use client";

import { ArrowRight, BookOpen, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Field, FieldLabel, Select } from "@/components/ui";
import { analyticsTimeRangeLabels } from "@/data/mock/creator-analytics";
import { organizationPreviewState, organizationRange, useOrganizationSnapshot } from "@/features/organization/hooks/use-organization-snapshot";
import { OrganizationEmpty, OrganizationError, OrganizationLoading } from "@/features/organization/components/organization-states";
import type { CourseLifecycleStatus } from "@/types/product";

const statusLabel: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "In review", published: "Published", unpublished: "Unpublished" };
const statusVariant: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = { draft: "neutral", review: "warning", published: "success", unpublished: "info" };
const courseStatuses: Array<CourseLifecycleStatus | "all"> = ["all", "published", "review", "draft", "unpublished"];

function courseStatus(value: string | null): CourseLifecycleStatus | "all" {
  return courseStatuses.includes(value as CourseLifecycleStatus | "all") ? value as CourseLifecycleStatus | "all" : "all";
}

export function OrganizationCourses() {
  const searchParams = useSearchParams();
  const range = organizationRange(searchParams.get("range"));
  const status = courseStatus(searchParams.get("status"));
  const previewState = organizationPreviewState(searchParams.get("state"));
  const { snapshot, loading, error, retry, updateQuery } = useOrganizationSnapshot({ timeRange: range, previewState });
  const visibleCourses = snapshot?.courses.filter((course) => status === "all" || course.status === status) ?? [];

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Organization workspace" title="Courses" description="Review learning content associated with your organization and inspect published-course outcomes." breadcrumb={[{ label: "Overview", href: "/organization" }, { label: "Courses" }]} />
      {loading ? <OrganizationLoading label="Loading organization courses" /> : error || !snapshot ? <OrganizationError message={error} onRetry={retry} /> : snapshot.courses.length === 0 ? <OrganizationEmpty /> : (
        <>
          <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:max-w-3xl">
            <Field><FieldLabel htmlFor="organization-course-status">Course status</FieldLabel><Select id="organization-course-status" value={status} onChange={(event) => updateQuery({ status: event.target.value === "all" ? null : event.target.value })}>{courseStatuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : statusLabel[item]}</option>)}</Select></Field>
            <Field><FieldLabel htmlFor="organization-course-range">Time range</FieldLabel><Select id="organization-course-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{Object.entries(analyticsTimeRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
          </Card>

          {visibleCourses.length === 0 ? <OrganizationEmpty title="No courses match this filter" description="Choose another lifecycle status to see organization courses." /> : <div className="mt-8 grid gap-4 md:grid-cols-2">
            {visibleCourses.map((course) => {
              const analytics = course.analytics;
              return <Card key={course.id} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-700"><BookOpen className="size-5" aria-hidden="true" /></span><Badge variant={statusVariant[course.status]}>{statusLabel[course.status]}</Badge></div><h2 className="type-title-large mt-5">{course.title}</h2><p className="type-body-small mt-1 text-text-secondary">Owner: {course.ownerName}</p>{course.status === "published" ? <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border-default py-4"><Metric label="Learner starts" value={String(analytics?.courseStarts ?? 0)} /><Metric label="Completion" value={`${analytics?.completionRate ?? 0}%`} /><Metric label="Post-assessment" value={`${analytics?.averageAssessmentScore ?? 0}%`} /><Metric label="Practical pass" value={`${analytics?.practicalPassRate ?? 0}%`} /></dl> : <p className="type-body-small mt-5 rounded-md bg-neutral-50 p-3 text-text-secondary">Learner analytics become available after the course is published.</p>}<div className="mt-5 flex flex-wrap gap-2"><ButtonLink href={`/organization/courses/${course.id}`} variant="secondary">{course.status === "published" ? "View performance" : "View course"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>{course.status === "published" && analytics && <Badge variant={analytics.courseStarts > 0 ? "info" : "neutral"} className="self-center"><Users className="size-3.5" aria-hidden="true" />{analytics.courseStarts > 0 ? "Learner activity" : "No activity yet"}</Badge>}</div></Card>;
            })}
          </div>}
        </>
      )}
    </ContentContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text-primary">{value}</dd></div>;
}
