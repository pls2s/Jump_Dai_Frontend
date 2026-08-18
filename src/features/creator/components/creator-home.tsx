"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, CirclePlus, RefreshCw } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Spinner } from "@/components/ui";
import { AnalyticsMetricGrid, CourseStatusSummary } from "@/features/creator-analytics/components/analytics-sections";
import { loadCreatorAnalytics } from "@/features/creator-analytics/services/creator-analytics-service";
import type { CreatorAnalyticsSnapshot } from "@/features/creator-analytics/types";
import { loadCourseList, type CourseListItem } from "@/features/courses/services/course-service";
import type { CourseLifecycleStatus } from "@/types/product";

const statusLabels: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "Review", published: "Published", unpublished: "Unpublished" };
const statusVariants: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = { draft: "neutral", review: "warning", published: "success", unpublished: "info" };

export function CreatorHome({ courseSaved = false }: { courseSaved?: boolean }) {
  const [analytics, setAnalytics] = useState<CreatorAnalyticsSnapshot | null>(null);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    const [analyticsResult, coursesResult] = await Promise.allSettled([
      loadCreatorAnalytics({ timeRange: "30d", selectedCourseId: null }),
      loadCourseList(),
    ]);
    if (analyticsResult.status === "fulfilled") setAnalytics(analyticsResult.value);
    else {
      setAnalytics(null);
      setError(analyticsResult.reason instanceof Error ? analyticsResult.reason.message : "Creator analytics is unavailable.");
    }
    if (coursesResult.status === "fulfilled") setCourses(coursesResult.value);
    else {
      setCourses([]);
      setError(coursesResult.reason instanceof Error ? coursesResult.reason.message : "We couldn’t load your courses.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Creator workspace" title="Welcome back" description="Track course progress, learner outcomes, and the next useful action." actions={<ButtonLink href="/creator/courses/new/basics" size="lg"><CirclePlus className="size-5" aria-hidden="true" />Create a new course</ButtonLink>} />
      {courseSaved && <p role="status" className="type-body-small mt-6 flex items-center gap-2 rounded-md bg-status-success-subtle p-3 text-status-success"><CheckCircle2 className="size-4" aria-hidden="true" />Your course setup was saved on this device.</p>}

      {loading ? <div role="status" className="mt-10 flex items-center gap-3 text-text-secondary"><Spinner />Loading Creator overview…</div>
        : error || !analytics ? <Card className="mt-8 p-6"><h2 className="type-title-large">Creator overview unavailable</h2><p className="type-body-small mt-2 text-text-secondary">{error}</p><Button className="mt-4" onClick={loadDashboard}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button></Card>
          : <>
              <section className="mt-10" aria-labelledby="overview-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 id="overview-heading" className="type-title-large">Workspace overview</h2><p className="type-body-small mt-1 text-text-secondary">A 30-day view of your current frontend demo activity.</p></div><ButtonLink href="/creator/analytics" variant="ghost" size="sm">Open analytics<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div><AnalyticsMetricGrid totals={analytics.totals} includeCourseCounts /></section>
              <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]"><CourseStatusSummary snapshot={analytics} /><Card className="flex flex-col justify-between border-blue-200 bg-blue-50 p-5 sm:p-6"><div><span className="flex size-10 items-center justify-center rounded-full bg-blue-800 text-white"><BarChart3 className="size-5" aria-hidden="true" /></span><h2 className="type-title-large mt-4">Learning performance</h2><p className="type-body-small mt-2 text-text-secondary">{analytics.totals.courseCompletions} learners completed a course in the selected demo period, with an average post-assessment score of {analytics.totals.averagePostAssessmentScore}%.</p></div><ButtonLink href="/creator/analytics" className="mt-5 w-fit">View learning analytics</ButtonLink></Card></div>
            </>}

      <section className="mt-10" aria-labelledby="recent-courses-heading">
        <div className="mb-4 flex items-center justify-between gap-4"><div><h2 id="recent-courses-heading" className="type-title-large">Recent courses</h2><p className="type-body-small mt-1 text-text-secondary">Continue work or inspect published-course performance.</p></div><ButtonLink href="/creator/courses" variant="ghost" size="sm">View all<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.slice(0, 5).map((course) => (
            <Card key={course.id} className="p-5">
              <div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-md bg-blue-50 text-blue-700"><BookOpen className="size-5" aria-hidden="true" /></span><Badge variant={statusVariants[course.status]}>{statusLabels[course.status]}</Badge></div>
              <h3 className="mt-5 font-semibold text-text-primary">{course.title}</h3>
              {course.status === "published" && analytics && <p className="type-body-small mt-2 text-text-secondary">{analytics.courses.find((item) => item.id === course.id)?.analytics?.courseStarts ?? 0} learners · {analytics.courses.find((item) => item.id === course.id)?.analytics?.completionRate ?? 0}% completion</p>}
              <div className="mt-5 flex flex-wrap gap-2"><ButtonLink href={course.destination} variant="secondary" size="sm">{course.actionLabel}</ButtonLink>{course.analyticsHref && <ButtonLink href={course.analyticsHref} size="sm">View analytics</ButtonLink>}</div>
            </Card>
          ))}
          <Card className="flex min-h-56 flex-col items-center justify-center border-dashed p-6 text-center"><CirclePlus className="size-6 text-action-primary" aria-hidden="true" /><p className="mt-3 font-semibold">Create another course</p><ButtonLink href="/creator/courses/new/basics" variant="secondary" size="sm" className="mt-4">Create course</ButtonLink></Card>
        </div>
      </section>
    </ContentContainer>
  );
}
