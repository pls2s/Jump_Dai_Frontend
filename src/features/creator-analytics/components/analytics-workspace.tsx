"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Download, RefreshCw } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Button, ButtonLink, Card, Field, FieldLabel, Select, Spinner, useToast } from "@/components/ui";
import { analyticsTimeRangeLabels } from "@/data/mock/creator-analytics";
import {
  AnalyticsEmptyState,
  AnalyticsMetricGrid,
  AssessmentSection,
  ContentPerformanceSection,
  CoursePerformanceSection,
  InsightsSection,
  LearnerProgressSection,
  NoLearnerActivity,
  NonPublishedAnalytics,
  SkillPerformanceSection,
} from "@/features/creator-analytics/components/analytics-sections";
import { loadCreatorAnalytics } from "@/features/creator-analytics/services/creator-analytics-service";
import type {
  AnalyticsPreviewState,
  AnalyticsTimeRange,
  CreatorAnalyticsSnapshot,
} from "@/features/creator-analytics/types";

const validRanges: AnalyticsTimeRange[] = ["7d", "30d", "90d", "all"];
const validPreviewStates: AnalyticsPreviewState[] = ["default", "empty", "loading", "error"];

function analyticsRange(value: string | null): AnalyticsTimeRange {
  return validRanges.includes(value as AnalyticsTimeRange) ? value as AnalyticsTimeRange : "30d";
}

function analyticsPreviewState(value: string | null): AnalyticsPreviewState {
  return validPreviewStates.includes(value as AnalyticsPreviewState) ? value as AnalyticsPreviewState : "default";
}

export function AnalyticsWorkspace({ fixedCourseId }: { fixedCourseId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const range = analyticsRange(searchParams.get("range"));
  const previewState = analyticsPreviewState(searchParams.get("state"));
  const selectedCourseId = fixedCourseId ?? searchParams.get("course");
  const [snapshot, setSnapshot] = useState<CreatorAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(previewState === "loading" || !snapshot);
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
      setSnapshot(await loadCreatorAnalytics({ timeRange: range, selectedCourseId, previewState }));
    } catch (caught) {
      setSnapshot(null);
      setError(caught instanceof Error ? caught.message : "Analytics couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [previewState, range, selectedCourseId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectedCourse = useMemo(
    () => snapshot?.courses.find((course) => course.id === selectedCourseId),
    [selectedCourseId, snapshot],
  );

  function updateQuery(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  function retry() {
    if (previewState === "error") {
      updateQuery({ state: null });
      return;
    }
    void load();
  }

  function exportCsv() {
    if (!snapshot?.visibleCourses.length) return;
    const headers = ["Course", "Active Learners", "Course Starts", "Completions", "Completion Rate", "Average Post Score", "Practical Pass Rate", "Verified Skills"];
    const rows = snapshot.visibleCourses.map((course) => [course.title, course.activeLearners, course.courseStarts, course.completions, `${course.completionRate}%`, `${course.averageAssessmentScore}%`, `${course.practicalPassRate}%`, course.verifiedSkills]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `skillsync-analytics-${selectedCourseId ?? "all-courses"}-${range}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast({ tone: "success", title: "Analytics CSV exported", description: "The file contains the metrics visible for the current filters." });
  }

  const title = fixedCourseId && selectedCourse ? selectedCourse.title : "Learning analytics";
  const description = fixedCourseId
    ? "Understand learner progress, assessment outcomes, and content performance for this course."
    : "See how learners are progressing and where your courses may need attention.";

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader
        eyebrow={fixedCourseId ? "Course analytics" : "Creator analytics"}
        title={title}
        description={description}
        breadcrumb={fixedCourseId ? [{ label: "Analytics", href: "/creator/analytics" }, { label: selectedCourse?.title ?? "Course" }] : undefined}
        actions={snapshot && snapshot.visibleCourses.some((course) => course.courseStarts > 0) ? <Button onClick={exportCsv} variant="secondary"><Download className="size-4" aria-hidden="true" />Export CSV</Button> : undefined}
      />

      {!fixedCourseId && snapshot && snapshot.totals.publishedCourses > 0 && (
        <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:max-w-3xl">
          <Field><FieldLabel htmlFor="analytics-course">Course</FieldLabel><Select id="analytics-course" value={selectedCourseId ?? "all"} onChange={(event) => updateQuery({ course: event.target.value === "all" ? null : event.target.value })}><option value="all">All published courses</option>{snapshot.courses.filter((course) => course.status === "published").map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</Select></Field>
          <Field><FieldLabel htmlFor="analytics-range">Time range</FieldLabel><Select id="analytics-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{validRanges.map((item) => <option key={item} value={item}>{analyticsTimeRangeLabels[item]}</option>)}</Select></Field>
        </Card>
      )}

      {fixedCourseId && (
        <Card className="mt-7 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <Field className="w-full sm:max-w-xs"><FieldLabel htmlFor="analytics-detail-range">Time range</FieldLabel><Select id="analytics-detail-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{validRanges.map((item) => <option key={item} value={item}>{analyticsTimeRangeLabels[item]}</option>)}</Select></Field>
          <ButtonLink href="/creator/analytics" variant="ghost">View all course analytics</ButtonLink>
        </Card>
      )}

      {loading ? (
        <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite"><Spinner className="size-7" /><h2 className="type-title-large mt-5">Loading analytics</h2><p className="type-body-small mt-2 text-text-secondary">Preparing course, learner, assessment, and skill metrics…</p></Card>
      ) : error ? (
        <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center" role="alert"><span className="flex size-12 items-center justify-center rounded-full bg-status-error-subtle text-status-error"><BarChart3 className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">Analytics unavailable</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{error}</p><Button className="mt-5" onClick={retry}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button></Card>
      ) : !snapshot ? null
        : !fixedCourseId && snapshot.totals.publishedCourses === 0 ? <div className="mt-8"><AnalyticsEmptyState /></div>
          : selectedCourse && selectedCourse.status !== "published" ? <div className="mt-8"><NonPublishedAnalytics title={selectedCourse.title} status={selectedCourse.status} /></div>
            : snapshot.visibleCourses.length === 0 ? <Card className="mt-8 p-8 text-center"><h2 className="type-title-large">Course analytics not found</h2><p className="type-body-small mt-2 text-text-secondary">This course is not part of the current Creator analytics fixture.</p><ButtonLink href="/creator/analytics" className="mt-5">Back to analytics</ButtonLink></Card>
              : snapshot.visibleCourses.every((course) => course.courseStarts === 0) ? <div className="mt-8"><NoLearnerActivity title={selectedCourse?.title ?? snapshot.visibleCourses[0].title} /></div>
                : (
                  <div className="mt-8 grid gap-10">
                    <AnalyticsMetricGrid totals={snapshot.totals} />
                    <LearnerProgressSection snapshot={snapshot} />
                    {!fixedCourseId && <CoursePerformanceSection courses={snapshot.visibleCourses} />}
                    <AssessmentSection snapshot={snapshot} />
                    <SkillPerformanceSection skills={snapshot.skills} />
                    <ContentPerformanceSection content={snapshot.content} />
                    <InsightsSection snapshot={snapshot} />
                  </div>
                )}
    </ContentContainer>
  );
}

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
