"use client";

import { BookOpenCheck, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Field, FieldLabel, Select } from "@/components/ui";
import { analyticsTimeRangeLabels } from "@/data/mock/creator-analytics";
import {
  AnalyticsMetricGrid,
  AssessmentSection,
  ContentPerformanceSection,
  LearnerProgressSection,
  SkillPerformanceSection,
} from "@/features/creator-analytics/components/analytics-sections";
import { organizationPreviewState, organizationRange, useOrganizationSnapshot } from "@/features/organization/hooks/use-organization-snapshot";
import { OrganizationError, OrganizationLoading } from "@/features/organization/components/organization-states";
import type { CourseLifecycleStatus } from "@/types/product";

const statusLabel: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "In review", published: "Published", unpublished: "Unpublished" };
const statusVariant: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = { draft: "neutral", review: "warning", published: "success", unpublished: "info" };

export function OrganizationCourseDetail({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const range = organizationRange(searchParams.get("range"));
  const previewState = organizationPreviewState(searchParams.get("state"));
  const { snapshot, loading, error, retry, updateQuery } = useOrganizationSnapshot({ timeRange: range, selectedCourseId: courseId, previewState });
  const course = snapshot?.courses.find((item) => item.id === courseId);
  const courseAnalytics = snapshot?.analytics.visibleCourses.find((item) => item.courseId === courseId);

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Organization course" title={course?.title ?? "Course performance"} description="Organization-level learning outcomes without Creator editing or Admin controls." breadcrumb={[{ label: "Courses", href: "/organization/courses" }, { label: course?.title ?? "Course" }]} actions={course ? <Badge variant={statusVariant[course.status]}>{statusLabel[course.status]}</Badge> : undefined} />
      {loading ? <OrganizationLoading label="Loading course performance" /> : error || !snapshot ? <OrganizationError message={error} onRetry={retry} /> : !course ? <Card className="mt-8 p-8 text-center"><h2 className="type-title-large">Organization course not found</h2><p className="type-body-small mt-2 text-text-secondary">This course is not associated with the current Organization workspace.</p><ButtonLink href="/organization/courses" className="mt-5">Back to courses</ButtonLink></Card> : (
        <>
          <Card className="mt-7 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="type-caption text-text-tertiary">Course owner</p><p className="mt-1 font-semibold">{course.ownerName}</p></div><Field className="w-full sm:max-w-xs"><FieldLabel htmlFor="organization-course-detail-range">Time range</FieldLabel><Select id="organization-course-detail-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{Object.entries(analyticsTimeRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field></Card>
          {course.status !== "published" ? <Card className="mt-8 flex flex-col items-center p-10 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><BookOpenCheck className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">Learning analytics begin after publishing</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{course.title} is currently {statusLabel[course.status].toLowerCase()}. Organization users can inspect its status, but cannot edit or publish Creator-owned content here.</p><ButtonLink href="/organization/courses" variant="secondary" className="mt-5">Back to courses</ButtonLink></Card> : !courseAnalytics || courseAnalytics.courseStarts === 0 ? <Card className="mt-8 flex flex-col items-center p-10 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Users className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">No learner activity yet</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{course.title} is published. Organization analytics will appear after learners begin the course.</p><ButtonLink href="/organization/courses" variant="secondary" className="mt-5">Back to courses</ButtonLink></Card> : <div className="mt-8 grid gap-10"><AnalyticsMetricGrid totals={snapshot.analytics.totals} /><LearnerProgressSection snapshot={snapshot.analytics} /><AssessmentSection snapshot={snapshot.analytics} /><SkillPerformanceSection skills={snapshot.analytics.skills} /><ContentPerformanceSection content={snapshot.analytics.content} /></div>}
        </>
      )}
    </ContentContainer>
  );
}
