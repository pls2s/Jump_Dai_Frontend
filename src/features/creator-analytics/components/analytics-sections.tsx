import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge, ButtonLink, Card, Progress } from "@/components/ui";
import { skillsNeedingAttention } from "@/features/creator-analytics/lib/analytics-engine";
import type {
  ContentAnalytics,
  CourseAnalytics,
  CreatorAnalyticsSnapshot,
  CreatorAnalyticsTotals,
  SkillAnalytics,
} from "@/features/creator-analytics/types";
import type { CourseLifecycleStatus } from "@/types/product";

const statusLabels: Record<CourseLifecycleStatus, string> = {
  draft: "Draft",
  review: "In review",
  published: "Published",
  unpublished: "Unpublished",
};

const statusVariants: Record<CourseLifecycleStatus, "neutral" | "warning" | "success" | "info"> = {
  draft: "neutral",
  review: "warning",
  published: "success",
  unpublished: "info",
};

export function AnalyticsMetricGrid({ totals, includeCourseCounts = false }: { totals: CreatorAnalyticsTotals; includeCourseCounts?: boolean }) {
  const metrics = includeCourseCounts
    ? [
        { label: "Total courses", value: String(totals.totalCourses), helper: `${totals.publishedCourses} published` },
        { label: "Published courses", value: String(totals.publishedCourses), helper: "Available to learners" },
        { label: "Active learners", value: totals.activeLearners.toLocaleString(), helper: "In the selected period" },
        { label: "Completion rate", value: `${totals.completionRate}%`, helper: `${totals.courseCompletions} completions` },
      ]
    : [
        { label: "Active learners", value: totals.activeLearners.toLocaleString(), helper: "In the selected period" },
        { label: "Course starts", value: totals.courseStarts.toLocaleString(), helper: "Learners who began" },
        { label: "Course completions", value: totals.courseCompletions.toLocaleString(), helper: `${totals.completionRate}% completion rate` },
        { label: "Average post-assessment", value: `${totals.averagePostAssessmentScore}%`, helper: "Completed attempts" },
        { label: "Verified skills", value: totals.verifiedSkills.toLocaleString(), helper: "Knowledge plus applied evidence" },
      ];
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${includeCourseCounts ? "xl:grid-cols-4" : "xl:grid-cols-5"}`}>
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4 sm:p-5">
          <p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">{metric.value}</p>
          <p className="type-caption mt-1 text-text-secondary">{metric.helper}</p>
        </Card>
      ))}
    </div>
  );
}

export function CourseStatusSummary({ snapshot }: { snapshot: CreatorAnalyticsSnapshot }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4"><div><h2 className="type-title-large">Course status</h2><p className="type-body-small mt-1 text-text-secondary">Current lifecycle across your workspace.</p></div><BookOpenCheck className="size-5 text-action-primary" aria-hidden="true" /></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {snapshot.statusCounts.map((item) => <div key={item.status} className="rounded-md bg-neutral-25 p-3"><Badge variant={statusVariants[item.status]}>{statusLabels[item.status]}</Badge><p className="mt-3 text-2xl font-semibold">{item.count}</p></div>)}
      </div>
    </Card>
  );
}

export function LearnerProgressSection({ snapshot }: { snapshot: CreatorAnalyticsSnapshot }) {
  const max = snapshot.funnel[0]?.value ?? 1;
  return (
    <section aria-labelledby="learner-progress-heading">
      <div className="mb-4"><h2 id="learner-progress-heading" className="type-title-large">Learner progress</h2><p className="type-body-small mt-1 text-text-secondary">How learners move from starting a course to completing required evidence.</p></div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5 sm:p-6">
          <ol className="grid gap-4">
            {snapshot.funnel.map((metric, index) => (
              <li key={metric.id}>
                <div className="mb-2 flex items-center justify-between gap-4"><span className="type-body-small font-medium text-text-primary"><span className="mr-2 text-text-tertiary">{index + 1}</span>{metric.label}</span><span className="type-body-small font-semibold tabular-nums">{metric.value}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100" role="img" aria-label={`${metric.label}: ${metric.value} learners`}><div className="h-full rounded-full bg-blue-700" style={{ width: `${Math.round((metric.value / Math.max(max, 1)) * 100)}%` }} /></div>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 p-5">
          <span className="flex size-10 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><TrendingUp className="size-5" aria-hidden="true" /></span>
          <h3 className="mt-4 font-semibold">Largest drop-off</h3>
          {snapshot.largestDropOff ? <><p className="mt-2 text-sm font-medium text-text-primary">{snapshot.largestDropOff.from} → {snapshot.largestDropOff.to}</p><p className="type-body-small mt-2 text-text-secondary">{snapshot.largestDropOff.count} learners did not continue. Consider reviewing the transition, instructions, or expected time.</p></> : <p className="type-body-small mt-2 text-text-secondary">No drop-off is visible in the current data.</p>}
        </Card>
      </div>
    </section>
  );
}

export function CoursePerformanceSection({ courses }: { courses: CourseAnalytics[] }) {
  return (
    <section aria-labelledby="course-performance-heading">
      <div className="mb-4"><h2 id="course-performance-heading" className="type-title-large">Course performance</h2><p className="type-body-small mt-1 text-text-secondary">Compare published courses with learner activity.</p></div>
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.courseId} className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="success">Published</Badge>{course.courseStarts === 0 && <Badge variant="neutral">No learner activity</Badge>}</div><h3 className="type-title-large mt-3">{course.title}</h3><p className="type-caption mt-1 text-text-tertiary">{course.courseStarts} learner starts</p></div>
              <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
                <CompactMetric label="Completion" value={`${course.completionRate}%`} />
                <CompactMetric label="Assessment" value={`${course.averageAssessmentScore}%`} />
                <CompactMetric label="Practical pass" value={`${course.practicalPassRate}%`} />
                <CompactMetric label="Verified skills" value={String(course.verifiedSkills)} />
              </dl>
              <ButtonLink href={`/creator/analytics/${course.courseId}`} variant="secondary" size="sm">Open analytics<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text-primary">{value}</dd></div>;
}

export function AssessmentSection({ snapshot }: { snapshot: CreatorAnalyticsSnapshot }) {
  const assessment = snapshot.assessment;
  if (!assessment) return null;
  const metrics = [
    { label: "Pre-Assessment average", value: `${assessment.preAssessmentAverage}%` },
    { label: "Post-Assessment average", value: `${assessment.postAssessmentAverage}%` },
    { label: "Average improvement", value: `+${assessment.averageImprovement} points` },
    { label: "Practical pass rate", value: `${assessment.practicalPassRate}%` },
  ];
  return <section aria-labelledby="assessment-heading"><div className="mb-4"><h2 id="assessment-heading" className="type-title-large">Assessment performance</h2><p className="type-body-small mt-1 text-text-secondary">Aggregate outcomes from the same assessment concepts used in the learner journey.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} className="p-4 sm:p-5"><p className="type-caption text-text-tertiary">{metric.label}</p><p className="mt-2 text-2xl font-semibold">{metric.value}</p></Card>)}</div></section>;
}

export function SkillPerformanceSection({ skills }: { skills: SkillAnalytics[] }) {
  const needsAttention = skillsNeedingAttention(skills);
  return (
    <section aria-labelledby="skill-performance-heading">
      <div className="mb-4"><h2 id="skill-performance-heading" className="type-title-large">Skill outcomes</h2><p className="type-body-small mt-1 text-text-secondary">Compare starting knowledge with post-learning performance.</p></div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
        <Card className="divide-y divide-border-default">
          {skills.map((skill) => <div key={skill.skillId} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{skill.name}</h3><p className="type-caption mt-1 text-text-tertiary">Pre {skill.preScore}% → Post {skill.postScore}%</p></div><Badge variant="success">+{skill.improvement} points</Badge></div><Progress value={skill.postScore} label={`Post-learning competency for ${skill.name}`} showValue size="sm" className="mt-4" /></div>)}
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><CircleAlert className="size-4" aria-hidden="true" /></span><div><h3 className="font-semibold">Needs attention</h3><p className="type-caption text-text-tertiary">Deterministic thresholds: low post score, practical pass, or high retries.</p></div></div>
          {needsAttention.length ? <div className="mt-5 grid gap-5">{needsAttention.slice(0, 3).map((skill) => <div key={skill.skillId}><p className="font-semibold">{skill.name}</p><p className="type-body-small mt-1 text-text-secondary">Post {skill.postScore}% · Practical pass {skill.practicalPassRate}% · Retry {skill.retryRate}%</p><p className="type-caption mt-2 text-text-tertiary">Common challenge: {skill.commonChallenge}</p></div>)}</div> : <p className="type-body-small mt-5 text-text-secondary">No measured skill crosses the attention thresholds.</p>}
        </Card>
      </div>
    </section>
  );
}

export function ContentPerformanceSection({ content }: { content: ContentAnalytics[] }) {
  return (
    <section aria-labelledby="content-performance-heading">
      <div className="mb-4"><h2 id="content-performance-heading" className="type-title-large">Content performance</h2><p className="type-body-small mt-1 text-text-secondary">Identify lessons and activities that may benefit from clearer explanation or practice.</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        {content.map((item) => <Card key={item.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge variant="neutral">{item.type}</Badge><h3 className="mt-3 font-semibold">{item.title}</h3></div><span className="type-body-small font-semibold">{item.completionRate}% complete</span></div><dl className="mt-4 grid grid-cols-2 gap-3"><CompactMetric label="Quiz score" value={item.quizScore === undefined ? "Not measured" : `${item.quizScore}%`} /><CompactMetric label="Retry rate" value={`${item.retryRate}%`} /></dl></Card>)}
      </div>
    </section>
  );
}

export function InsightsSection({ snapshot }: { snapshot: CreatorAnalyticsSnapshot }) {
  return (
    <section aria-labelledby="insights-heading">
      <div className="mb-4"><h2 id="insights-heading" className="type-title-large">Insights</h2><p className="type-body-small mt-1 text-text-secondary">Explainable observations calculated directly from the visible metrics.</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        {snapshot.insights.map((insight) => <Card key={insight.id} className="p-5"><Lightbulb className="size-5 text-action-primary" aria-hidden="true" /><h3 className="mt-3 font-semibold">{insight.title}</h3><p className="type-body-small mt-2 text-text-secondary">{insight.description}</p></Card>)}
      </div>
    </section>
  );
}

export function NoLearnerActivity({ title }: { title: string }) {
  return <Card className="flex flex-col items-center px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Users className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-4">No learner activity yet</h2><p className="type-body-small mt-2 max-w-md text-text-secondary">{title} is published. Analytics will appear after learners begin the course.</p><ButtonLink href="/creator/courses" variant="secondary" className="mt-5">Back to My Courses</ButtonLink></Card>;
}

export function NonPublishedAnalytics({ title, status }: { title: string; status: CourseLifecycleStatus }) {
  return <Card className="flex flex-col items-center px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><BookOpenCheck className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-4">Analytics begin after publishing</h2><p className="type-body-small mt-2 max-w-md text-text-secondary">{title} is currently {statusLabels[status].toLowerCase()}. Publish the reviewed course before expecting learner performance data.</p><ButtonLink href="/creator/courses" className="mt-5">View my courses</ButtonLink></Card>;
}

export function AnalyticsEmptyState() {
  return <Card className="flex flex-col items-center px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><CheckCircle2 className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-4">No learning analytics yet</h2><p className="type-body-small mt-2 max-w-md text-text-secondary">Publish a course and invite learners to start seeing progress, assessment, skill, and content signals.</p><ButtonLink href="/creator/courses" className="mt-5">View my courses</ButtonLink></Card>;
}
