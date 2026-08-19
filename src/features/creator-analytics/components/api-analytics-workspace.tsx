"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, Download, Lightbulb, Users } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ErrorState, Field, FieldLabel, LoadingState, Progress, Select, useToast } from "@/components/ui";
import { analyticsTimeRangeLabels } from "@/data/mock/creator-analytics";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import type { AnalyticsTimeRange } from "@/features/creator-analytics/types";
import {
  exportApiCreatorDashboard,
  getApiCreatorDashboard,
  type ApiCreatorDashboard,
  type DashboardFilters,
} from "../api/dashboard-api";

const validRanges: AnalyticsTimeRange[] = ["7d", "30d", "90d", "all"];

function getAccessToken() {
  const session = getAuthSession();
  return session?.mode === "api" ? session.accessToken : null;
}

function readRange(value: string | null): AnalyticsTimeRange {
  return validRanges.includes(value as AnalyticsTimeRange) ? value as AnalyticsTimeRange : "30d";
}

function parseCourseId(value: string | null | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const numericId = Number(value);
  return Number.isSafeInteger(numericId) && numericId > 0 ? numericId : null;
}

function filtersFor(range: AnalyticsTimeRange, courseId: number | null): DashboardFilters {
  if (range === "all") return courseId ? { courseId } : {};
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  const dateFrom = from.toISOString().slice(0, 10);
  const dateTo = now.toISOString().slice(0, 10);
  return { ...(courseId ? { courseId } : {}), dateFrom, dateTo };
}

export function ApiAnalyticsWorkspace({ fixedCourseId }: { fixedCourseId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const range = readRange(searchParams.get("range"));
  const selectedCourseId = parseCourseId(fixedCourseId ?? searchParams.get("course"));
  const [report, setReport] = useState<ApiCreatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    if (fixedCourseId && selectedCourseId === null) {
      setReport(null);
      setError("A backend analytics course ID must be a positive number.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setReport(await getApiCreatorDashboard(filtersFor(range, selectedCourseId), token));
    } catch (requestError) {
      setReport(null);
      setError(requestError instanceof Error ? requestError.message : "Analytics couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [fixedCourseId, range, router, selectedCourseId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function updateQuery(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  async function downloadReport() {
    const token = getAccessToken();
    if (!token) return router.replace("/sign-in");
    setExporting(true);
    try {
      const result = await exportApiCreatorDashboard(filtersFor(range, selectedCourseId), "csv", token);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast({ tone: "success", title: "Dashboard CSV exported" });
    } catch (requestError) {
      showToast({ tone: "error", title: "Dashboard export failed", description: requestError instanceof Error ? requestError.message : "Try again." });
    } finally {
      setExporting(false);
    }
  }

  const selectedCourse = selectedCourseId ? report?.courses.find((course) => course.course_id === selectedCourseId) : null;
  const title = fixedCourseId ? selectedCourse?.course_title ?? "Course analytics" : "Learning analytics";

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow={fixedCourseId ? "Course analytics" : "Creator analytics"} title={title} description="Creator-owned course, learner, assessment, error, and skill-gap metrics supplied by the dashboard API." breadcrumb={fixedCourseId ? [{ label: "Analytics", href: "/creator/analytics" }, { label: title }] : undefined} actions={report ? <Button variant="secondary" onClick={() => void downloadReport()} isLoading={exporting} loadingLabel="Exporting CSV…"><Download className="size-4" aria-hidden="true" />Export CSV</Button> : undefined} />
      {!fixedCourseId && report && <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:max-w-3xl"><Field><FieldLabel htmlFor="api-analytics-course">Course</FieldLabel><Select id="api-analytics-course" value={selectedCourseId ? String(selectedCourseId) : "all"} onChange={(event) => updateQuery({ course: event.target.value === "all" ? null : event.target.value })}><option value="all">All creator courses</option>{report.courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.course_title}</option>)}</Select></Field><Field><FieldLabel htmlFor="api-analytics-range">Time range</FieldLabel><Select id="api-analytics-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{validRanges.map((item) => <option key={item} value={item}>{analyticsTimeRangeLabels[item]}</option>)}</Select></Field></Card>}
      {fixedCourseId && <Card className="mt-7 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5"><Field className="w-full sm:max-w-xs"><FieldLabel htmlFor="api-analytics-detail-range">Time range</FieldLabel><Select id="api-analytics-detail-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{validRanges.map((item) => <option key={item} value={item}>{analyticsTimeRangeLabels[item]}</option>)}</Select></Field><ButtonLink href="/creator/analytics" variant="ghost">View all course analytics</ButtonLink></Card>}
      {loading ? <LoadingState title="Loading analytics" description="Preparing backend creator metrics…" /> : error ? <ErrorState title="Analytics unavailable" description={error} onRetry={() => void load()} icon={<BarChart3 className="size-6" aria-hidden="true" />} /> : !report ? null : report.summary.course_count === 0 ? <NoCoursesState /> : <div className="mt-8 grid gap-10"><SummaryGrid report={report} /><CourseMetrics courses={report.courses} /><LearnerProgress learners={report.learners} /><div className="grid gap-6 xl:grid-cols-2"><CommonErrors items={report.common_errors} /><SkillGaps items={report.skill_gaps} /></div><Insights items={report.course_improvement_insights} /></div>}
    </ContentContainer>
  );
}

function SummaryGrid({ report }: { report: ApiCreatorDashboard }) {
  const metrics = [
    { label: "Creator courses", value: report.summary.course_count },
    { label: "Learners", value: report.summary.learner_count },
    { label: "Completed learners", value: report.summary.completed_learner_count },
    { label: "Completion rate", value: `${report.summary.completion_rate}%` },
    { label: "Average assessment", value: `${report.summary.average_assessment_score}%` },
  ];
  return <section><div className="mb-4"><h2 className="type-title-large">Overview</h2><p className="type-body-small mt-1 text-text-secondary">Metrics for the currently selected backend filter.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metrics.map((metric) => <Card key={metric.label} className="p-4 sm:p-5"><p className="type-caption text-text-tertiary">{metric.label}</p><p className="mt-2 text-3xl font-semibold">{metric.value}</p></Card>)}</div></section>;
}

function CourseMetrics({ courses }: { courses: ApiCreatorDashboard["courses"] }) {
  return <section><div className="mb-4"><h2 className="type-title-large">Course performance</h2><p className="type-body-small mt-1 text-text-secondary">Creator-owned courses returned by the dashboard API.</p></div><div className="grid gap-4">{courses.map((course) => <Card key={course.course_id} className="p-5 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-semibold">{course.course_title}</h3><p className="type-caption mt-1 text-text-tertiary">{course.learner_count} learners · {course.completed_learner_count} completed</p></div><dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-2xl"><Metric label="Completion" value={`${course.completion_rate}%`} /><Metric label="Assessment" value={`${course.average_assessment_score}%`} /><Metric label="Learners" value={String(course.learner_count)} /></dl><ButtonLink href={`/creator/analytics/${course.course_id}`} variant="secondary" size="sm">Open analytics<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div></Card>)}</div></section>;
}

function LearnerProgress({ learners }: { learners: ApiCreatorDashboard["learners"] }) {
  return <section><div className="mb-4"><h2 className="type-title-large">Learner progress</h2><p className="type-body-small mt-1 text-text-secondary">Progress and latest assessment score returned for each learner record.</p></div><Card className="divide-y divide-border-default overflow-hidden">{learners.map((learner) => <div key={`${learner.course_id}-${learner.learner_id}`} className="grid gap-4 p-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1.2fr)_7rem_7rem]"><div><p className="font-semibold">{learner.learner_name}</p><p className="type-caption mt-1 text-text-tertiary">{learner.course_title}</p></div><div><div className="flex justify-between gap-3"><span className="text-sm">Progress</span><span className="text-sm font-semibold">{learner.progress_percentage}%</span></div><Progress className="mt-2" value={learner.progress_percentage} size="sm" label={`${learner.learner_name} progress`} /></div><Metric label="Assessment" value={`${learner.assessment_score}%`} /><Badge variant={learner.completed ? "success" : "info"}>{learner.completed ? "Completed" : "In progress"}</Badge></div>)}{!learners.length && <div className="p-6 text-sm text-text-secondary">No learner activity matches the current filter.</div>}</Card></section>;
}

function CommonErrors({ items }: { items: ApiCreatorDashboard["common_errors"] }) {
  return <section><div className="mb-4"><h2 className="type-title-large">Common errors</h2><p className="type-body-small mt-1 text-text-secondary">Topics reported by assessment analytics.</p></div><Card className="divide-y divide-border-default">{items.map((item) => <div key={`${item.course_id}-${item.topic}`} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{item.topic}</h3><Badge variant="warning">{item.affected_learner_count} learners</Badge></div><p className="type-caption mt-2 text-text-tertiary">{item.course_title} · {item.occurrence_count} occurrences</p></div>)}{!items.length && <div className="p-5 text-sm text-text-secondary">No common-error pattern is available for this filter.</div>}</Card></section>;
}

function SkillGaps({ items }: { items: ApiCreatorDashboard["skill_gaps"] }) {
  return <section><div className="mb-4"><h2 className="type-title-large">Skill gaps</h2><p className="type-body-small mt-1 text-text-secondary">Skills where learners need additional support.</p></div><Card className="divide-y divide-border-default">{items.map((item) => <div key={`${item.course_id}-${item.skill}`} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{item.skill}</h3><Badge variant="warning">{item.affected_learner_count} learners</Badge></div><p className="type-caption mt-2 text-text-tertiary">{item.course_title}</p></div>)}{!items.length && <div className="p-5 text-sm text-text-secondary">No skill-gap pattern is available for this filter.</div>}</Card></section>;
}

function Insights({ items }: { items: ApiCreatorDashboard["course_improvement_insights"] }) {
  return <section><div className="mb-4"><h2 className="type-title-large">Course improvement insights</h2><p className="type-body-small mt-1 text-text-secondary">Recommendations returned directly by the backend analytics service.</p></div><div className="grid gap-3 md:grid-cols-2">{items.map((item) => <Card key={`${item.course_id}-${item.code}`} className="p-5"><div className="flex items-center justify-between gap-3"><Lightbulb className="size-5 text-action-primary" aria-hidden="true" /><Badge variant={item.severity === "HIGH" ? "warning" : "info"}>{item.severity}</Badge></div><h3 className="mt-3 font-semibold">{item.message}</h3><p className="type-body-small mt-2 text-text-secondary">{item.recommendation}</p><p className="type-caption mt-3 text-text-tertiary">{item.course_title}</p></Card>)}{!items.length && <Card className="p-5 text-sm text-text-secondary">No course improvement recommendation is available for this filter.</Card>}</div></section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}

function NoCoursesState() {
  return <Card className="mt-8 flex flex-col items-center px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Users className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-4">No creator courses yet</h2><p className="type-body-small mt-2 max-w-md text-text-secondary">Create a course before backend analytics can report learner activity.</p><ButtonLink href="/creator/courses" className="mt-5">View my courses</ButtonLink></Card>;
}
