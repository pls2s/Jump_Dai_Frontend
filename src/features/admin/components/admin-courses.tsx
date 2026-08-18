"use client";

import { BookOpenCheck, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Field, FieldLabel, Progress, Select, useToast } from "@/components/ui";
import { AssessmentSection, ContentPerformanceSection, SkillPerformanceSection } from "@/features/creator-analytics/components/analytics-sections";
import { AdminEmpty, AdminError, AdminLoading } from "@/features/admin/components/admin-states";
import { adminPreviewState, useAdminSnapshot } from "@/features/admin/hooks/use-admin-snapshot";
import type { CourseLifecycleStatus } from "@/types/product";
import { downloadCsv } from "@/lib/export/csv";

const statuses: Array<CourseLifecycleStatus | "all"> = ["all", "published", "review", "draft", "unpublished"];
const statusLabels: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "In review", published: "Published", unpublished: "Unpublished" };
const statusVariants: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = { draft: "neutral", review: "warning", published: "success", unpublished: "info" };

export function AdminCourses() {
  const searchParams = useSearchParams();
  const { snapshot, loading, error, retry } = useAdminSnapshot(adminPreviewState(searchParams.get("state")));
  const [status, setStatus] = useState<CourseLifecycleStatus | "all">("all");
  const courses = snapshot?.courses.filter((course) => status === "all" || course.status === status) ?? [];
  const { showToast } = useToast();

  function exportCourseOversight() {
    if (!courses.length) return;
    downloadCsv({
      filename: `skillsync-admin-courses-${status}.csv`,
      headers: ["Course", "Owner", "Organization", "Status", "Learner Starts", "Completion Rate", "Average Post Score", "Verified Skills"],
      rows: courses.map((course) => [course.title, course.ownerName, course.organizationName, statusLabels[course.status], course.analytics?.courseStarts ?? 0, `${course.analytics?.completionRate ?? 0}%`, `${course.analytics?.averageAssessmentScore ?? 0}%`, course.analytics?.verifiedSkills ?? 0]),
    });
    showToast({ tone: "success", title: "Course oversight CSV exported", description: "The file reflects the current lifecycle filter." });
  }

  return <ContentContainer className="max-w-[96rem]"><PageHeader eyebrow="Platform administration" title="Courses" description="Inspect ownership, lifecycle, and learner activity without editing Creator-owned content." breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Courses" }]} actions={courses.length ? <Button variant="secondary" onClick={exportCourseOversight}><Download className="size-4" aria-hidden="true" />Export CSV</Button> : undefined} />{loading ? <AdminLoading label="Loading platform courses" /> : error || !snapshot ? <AdminError message={error} onRetry={retry} /> : snapshot.courses.length === 0 ? <AdminEmpty title="No courses found" description="Platform courses will appear here after Creators begin course setup." /> : <><Card className="mt-7 max-w-sm p-4 sm:p-5"><Field><FieldLabel htmlFor="admin-course-status">Course status</FieldLabel><Select id="admin-course-status" value={status} onChange={(event) => setStatus(event.target.value as CourseLifecycleStatus | "all")}>{statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : statusLabels[item]}</option>)}</Select></Field></Card>{courses.length === 0 ? <AdminEmpty title="No courses match this filter" description="Choose another lifecycle status to inspect platform courses." /> : <div className="mt-8 grid gap-4 md:grid-cols-2">{courses.map((course) => { const analytics = course.analytics; return <Card key={course.id} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-700"><BookOpenCheck className="size-5" aria-hidden="true" /></span><Badge variant={statusVariants[course.status]}>{statusLabels[course.status]}</Badge></div><h2 className="type-title-large mt-5">{course.title}</h2><p className="type-body-small mt-1 text-text-secondary">Owner: {course.ownerName}</p><p className="type-caption mt-1 text-text-tertiary">{course.organizationName ?? "Independent Creator content"}</p>{course.status === "published" ? <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border-default py-4"><Metric label="Learner starts" value={String(analytics?.courseStarts ?? 0)} /><Metric label="Completion" value={`${analytics?.completionRate ?? 0}%`} /><Metric label="Post-assessment" value={`${analytics?.averageAssessmentScore ?? 0}%`} /><Metric label="Verified skills" value={String(analytics?.verifiedSkills ?? 0)} /></dl> : <p className="type-body-small mt-5 rounded-md bg-neutral-50 p-3 text-text-secondary">Learner activity is unavailable until this existing lifecycle reaches Published.</p>}<ButtonLink href={`/admin/courses/${course.id}`} variant="secondary" size="sm" className="mt-5">Inspect course</ButtonLink></Card>; })}</div>}</>}</ContentContainer>;
}

export function AdminCourseDetail({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const { snapshot, loading, error, retry } = useAdminSnapshot(adminPreviewState(searchParams.get("state")));
  const course = snapshot?.courses.find((item) => item.id === courseId);
  const analytics = snapshot?.courseAnalytics.find((item) => item.courseId === courseId);
  return <ContentContainer className="max-w-[96rem]"><PageHeader eyebrow="Course oversight" title={course?.title ?? "Course detail"} description="Read-only platform context for lifecycle, ownership, and learning outcomes." breadcrumb={[{ label: "Courses", href: "/admin/courses" }, { label: course?.title ?? "Course" }]} actions={course ? <Badge variant={statusVariants[course.status]}>{statusLabels[course.status]}</Badge> : undefined} />{loading ? <AdminLoading label="Loading course oversight" /> : error || !snapshot ? <AdminError message={error} onRetry={retry} /> : !course ? <AdminEmpty title="Course not found" description="This course is not available in the current platform view." action={{ href: "/admin/courses", label: "Back to courses" }} /> : <><Card className="mt-7 grid gap-4 p-5 sm:grid-cols-3"><Metric label="Owner" value={course.ownerName} /><Metric label="Organization" value={course.organizationName ?? "Not associated"} /><Metric label="Last lifecycle update" value={course.updatedAt} /></Card>{course.status !== "published" ? <AdminEmpty title="Learning outcomes begin after publishing" description={`${course.title} is ${statusLabels[course.status].toLowerCase()}. Admin oversight is read-only and does not change Creator content or lifecycle.`} action={{ href: "/admin/courses", label: "Back to courses" }} /> : !analytics || analytics.courseStarts === 0 ? <AdminEmpty title="No learner activity yet" description="This course is published, but no learner participation has been recorded in the current fixture." action={{ href: "/admin/courses", label: "Back to courses" }} /> : <div className="mt-8 grid gap-10"><section aria-labelledby="admin-course-metrics"><h2 id="admin-course-metrics" className="type-title-large">Learning activity summary</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Learner starts" value={analytics.courseStarts} /><MetricCard label="Completion rate" value={`${analytics.completionRate}%`} /><MetricCard label="Post-assessment" value={`${analytics.averageAssessmentScore}%`} /><MetricCard label="Practical pass" value={`${analytics.practicalPassRate}%`} /></dl></section><section aria-labelledby="admin-course-funnel"><h2 id="admin-course-funnel" className="type-title-large">Learning progression</h2><Card className="mt-4 divide-y divide-border-default">{analytics.funnel.map((item) => <div key={item.id} className="p-4 sm:p-5"><div className="mb-2 flex items-center justify-between gap-4"><span className="type-body-small font-medium">{item.label}</span><span className="text-sm font-semibold">{item.value}</span></div><Progress value={analytics.courseStarts ? Math.round((item.value / analytics.courseStarts) * 100) : 0} label={`${item.label}: ${item.value} learners`} size="sm" /></div>)}</Card></section><AssessmentSection snapshot={{ timeRange: "all", selectedCourseId: courseId, totals: { totalCourses: 1, publishedCourses: 1, activeLearners: analytics.activeLearners, courseStarts: analytics.courseStarts, courseCompletions: analytics.completions, completionRate: analytics.completionRate, averagePostAssessmentScore: analytics.averageAssessmentScore, verifiedSkills: analytics.verifiedSkills }, statusCounts: [], courses: [course], visibleCourses: [analytics], funnel: analytics.funnel, assessment: analytics.assessment, skills: analytics.skills, content: analytics.content, insights: [], largestDropOff: null }} /><SkillPerformanceSection skills={analytics.skills} /><ContentPerformanceSection content={analytics.content} /></div>}</>}</ContentContainer>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text-primary">{value}</dd></div>; }
function MetricCard({ label, value }: { label: string; value: string | number }) { return <Card className="p-5"><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-2 text-2xl font-semibold">{value}</dd></Card>; }
