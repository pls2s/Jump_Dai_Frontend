"use client";

import { ArrowRight, CheckCircle2, Clock3, Target, UserRound, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Field, FieldLabel, Progress, Select } from "@/components/ui";
import { filterOrganizationLearners } from "@/features/organization/lib/organization-engine";
import { organizationPreviewState, useOrganizationSnapshot } from "@/features/organization/hooks/use-organization-snapshot";
import { OrganizationEmpty, OrganizationError, OrganizationLoading } from "@/features/organization/components/organization-states";
import type { OrganizationLearnerStatus } from "@/features/organization/types";

const learnerStatuses: Array<OrganizationLearnerStatus | "all"> = ["all", "active", "completed", "not-started"];
const statusLabels: Record<OrganizationLearnerStatus, string> = { active: "In progress", completed: "Completed", "not-started": "Not started" };

function learnerStatus(value: string | null): OrganizationLearnerStatus | "all" {
  return learnerStatuses.includes(value as OrganizationLearnerStatus | "all") ? value as OrganizationLearnerStatus | "all" : "all";
}

export function OrganizationLearners() {
  const searchParams = useSearchParams();
  const previewState = organizationPreviewState(searchParams.get("state"));
  const courseId = searchParams.get("course");
  const status = learnerStatus(searchParams.get("status"));
  const { snapshot, loading, error, retry, updateQuery } = useOrganizationSnapshot({ timeRange: "30d", previewState });
  const learners = snapshot ? filterOrganizationLearners(snapshot.learners, { courseId, status }) : [];

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Organization workspace" title="Learners" description="Review learning progress and skill outcomes without exposing assessment answers or unrelated personal data." breadcrumb={[{ label: "Overview", href: "/organization" }, { label: "Learners" }]} />
      {loading ? <OrganizationLoading label="Loading organization learners" /> : error || !snapshot ? <OrganizationError message={error} onRetry={retry} /> : snapshot.learners.length === 0 ? <OrganizationEmpty title="No learners yet" description="Learning data will appear once people begin organization courses." action={snapshot.courses.length ? { href: "/organization/courses", label: "View organization courses" } : undefined} /> : (
        <>
          <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:max-w-3xl">
            <Field><FieldLabel htmlFor="organization-learner-course">Course</FieldLabel><Select id="organization-learner-course" value={courseId ?? "all"} onChange={(event) => updateQuery({ course: event.target.value === "all" ? null : event.target.value })}><option value="all">All courses</option>{snapshot.courses.filter((course) => course.status === "published").map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</Select></Field>
            <Field><FieldLabel htmlFor="organization-learner-status">Learning status</FieldLabel><Select id="organization-learner-status" value={status} onChange={(event) => updateQuery({ status: event.target.value === "all" ? null : event.target.value })}>{learnerStatuses.map((item) => <option key={item} value={item}>{item === "all" ? "All learning statuses" : statusLabels[item]}</option>)}</Select></Field>
          </Card>

          <div className="mt-8 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Users className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">Learner overview</h2><p className="type-caption text-text-tertiary">{learners.length} learner {learners.length === 1 ? "record" : "records"} in this view</p></div></div>
          {learners.length === 0 ? <OrganizationEmpty title="No learners match these filters" description="Choose another course or learning status to see participating learners." /> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{learners.map((learner) => {
            const relevantCourse = courseId ? learner.currentLearning.find((course) => course.courseId === courseId) : learner.currentLearning[0];
            return <Card key={learner.id} className="p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-text-secondary"><UserRound className="size-5" aria-hidden="true" /></span><div className="min-w-0"><h3 className="font-semibold text-text-primary">{learner.name}</h3><p className="type-caption mt-1 text-text-tertiary">{learner.lastActivity}</p></div></div>{relevantCourse && <div className="mt-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="type-body-small font-medium text-text-primary">{relevantCourse.courseTitle}</p><Badge variant={relevantCourse.status === "completed" ? "success" : relevantCourse.status === "active" ? "info" : "neutral"}>{statusLabels[relevantCourse.status]}</Badge></div><Progress value={relevantCourse.progress} label="Course progress" showValue size="sm" className="mt-3" /></div>}<dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border-default pt-4"><div><dt className="type-caption text-text-tertiary">Completed courses</dt><dd className="mt-1 font-semibold">{learner.completedCourses}</dd></div><div><dt className="type-caption text-text-tertiary">Verified skills</dt><dd className="mt-1 font-semibold">{learner.verifiedSkills.length}</dd></div></dl><ButtonLink href={`/organization/learners/${learner.id}`} variant="secondary" size="sm" className="mt-5">View learner outcomes<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>;
          })}</div>}
        </>
      )}
    </ContentContainer>
  );
}

export function OrganizationLearnerDetail({ learnerId }: { learnerId: string }) {
  const searchParams = useSearchParams();
  const previewState = organizationPreviewState(searchParams.get("state"));
  const { snapshot, loading, error, retry } = useOrganizationSnapshot({ timeRange: "30d", previewState });
  const learner = snapshot?.learners.find((item) => item.id === learnerId);

  return (
    <ContentContainer className="max-w-[88rem]">
      <PageHeader eyebrow="Learner outcomes" title={learner?.name ?? "Learner detail"} description="Learning progress and evidence-backed skills associated with organization courses." breadcrumb={[{ label: "Learners", href: "/organization/learners" }, { label: learner?.name ?? "Learner" }]} />
      {loading ? <OrganizationLoading label="Loading learner outcomes" /> : error || !snapshot ? <OrganizationError message={error} onRetry={retry} /> : !learner ? <Card className="mt-8 p-8 text-center"><h2 className="type-title-large">Learner record not found</h2><p className="type-body-small mt-2 text-text-secondary">This learner is not part of the current Organization workspace.</p><ButtonLink href="/organization/learners" className="mt-5">Back to learners</ButtonLink></Card> : <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
        <div className="grid gap-8">
          <section aria-labelledby="current-learning-heading"><h2 id="current-learning-heading" className="type-title-large">Current learning</h2><div className="mt-4 grid gap-3">{learner.currentLearning.map((course) => <Card key={course.courseId} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{course.courseTitle}</h3><p className="type-caption mt-1 text-text-tertiary">Organization course</p></div><Badge variant={course.status === "completed" ? "success" : course.status === "active" ? "info" : "neutral"}>{statusLabels[course.status]}</Badge></div><Progress value={course.progress} label="Course progress" showValue className="mt-4" /><ButtonLink href={`/organization/courses/${course.courseId}`} variant="ghost" size="sm" className="mt-4">View course performance<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>)}</div></section>
          <section aria-labelledby="learner-skills-heading"><h2 id="learner-skills-heading" className="type-title-large">Verified skills</h2>{learner.verifiedSkills.length ? <Card className="mt-4 divide-y divide-border-default">{learner.verifiedSkills.map((skill) => <div key={skill} className="flex items-center gap-3 p-4"><CheckCircle2 className="size-5 text-status-success" aria-hidden="true" /><span className="font-medium">{skill}</span><Badge variant="success" className="ml-auto">Verified</Badge></div>)}</Card> : <Card className="mt-4 p-5"><p className="type-body-small text-text-secondary">No skills have enough knowledge and practical evidence for Verified status yet.</p></Card>}</section>
        </div>
        <aside className="grid h-fit gap-4"><Card className="p-5"><Target className="size-5 text-action-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">Learning summary</h2><dl className="mt-4 grid gap-3"><Summary label="Completed courses" value={String(learner.completedCourses)} /><Summary label="Verified skills" value={String(learner.verifiedSkills.length)} /></dl></Card><Card className="p-5"><Clock3 className="size-5 text-action-primary" aria-hidden="true" /><h2 className="mt-3 font-semibold">Recent activity</h2><p className="type-body-small mt-2 text-text-secondary">{learner.lastActivity}</p></Card></aside>
      </div>}
    </ContentContainer>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="type-body-small text-text-secondary">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}
