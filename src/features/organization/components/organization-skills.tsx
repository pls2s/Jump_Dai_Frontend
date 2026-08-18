"use client";

import { CircleAlert, Download, Target, TrendingUp, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, Card, Field, FieldLabel, Progress, Select, useToast } from "@/components/ui";
import { analyticsTimeRangeLabels } from "@/data/mock/creator-analytics";
import { organizationPreviewState, organizationRange, useOrganizationSnapshot } from "@/features/organization/hooks/use-organization-snapshot";
import { OrganizationEmpty, OrganizationError, OrganizationLoading } from "@/features/organization/components/organization-states";
import type { OrganizationSkillCoverage } from "@/features/organization/types";
import { downloadCsv } from "@/lib/export/csv";

const coverageOptions: Array<OrganizationSkillCoverage | "all"> = ["all", "strong", "developing", "needs-attention"];
const coverageLabels: Record<OrganizationSkillCoverage, string> = { strong: "Strong coverage", developing: "Developing", "needs-attention": "Needs attention" };

function skillCoverage(value: string | null): OrganizationSkillCoverage | "all" {
  return coverageOptions.includes(value as OrganizationSkillCoverage | "all") ? value as OrganizationSkillCoverage | "all" : "all";
}

export function OrganizationSkills() {
  const searchParams = useSearchParams();
  const range = organizationRange(searchParams.get("range"));
  const courseId = searchParams.get("course");
  const coverage = skillCoverage(searchParams.get("coverage"));
  const previewState = organizationPreviewState(searchParams.get("state"));
  const { snapshot, loading, error, retry, updateQuery } = useOrganizationSnapshot({ timeRange: range, selectedCourseId: courseId, previewState });
  const visibleSkills = snapshot?.skills.filter((skill) => coverage === "all" || skill.coverage === coverage) ?? [];
  const needsAttention = snapshot?.skills.filter((skill) => skill.coverage === "needs-attention").length ?? 0;
  const { showToast } = useToast();

  function exportSkillOutcomes() {
    if (!visibleSkills.length) return;
    downloadCsv({
      filename: `skillsync-organization-skills-${courseId ?? "all-courses"}-${range}.csv`,
      headers: ["Skill", "Learners", "Coverage", "Pre-Assessment", "Post-Assessment", "Average Improvement", "Practical Pass Rate", "Retry Rate"],
      rows: visibleSkills.map((skill) => [skill.name, skill.learnerCount, coverageLabels[skill.coverage], `${skill.preScore}%`, `${skill.postScore}%`, skill.improvement, `${skill.practicalPassRate}%`, `${skill.retryRate}%`]),
    });
    showToast({ tone: "success", title: "Skill outcomes CSV exported", description: "The file reflects the current course, time range, and coverage filters." });
  }

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Organization workspace" title="Skills & outcomes" description="Understand aggregate skill development without exposing individual assessment answers." breadcrumb={[{ label: "Overview", href: "/organization" }, { label: "Skills & outcomes" }]} actions={visibleSkills.length ? <Button variant="secondary" onClick={exportSkillOutcomes}><Download className="size-4" aria-hidden="true" />Export CSV</Button> : undefined} />
      {loading ? <OrganizationLoading label="Loading skill outcomes" /> : error || !snapshot ? <OrganizationError message={error} onRetry={retry} /> : snapshot.courses.length === 0 ? <OrganizationEmpty title="No skill data yet" description="Skill outcomes will appear after learners complete assessments and practical activities." /> : (
        <>
          <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
            <Field><FieldLabel htmlFor="organization-skill-course">Course</FieldLabel><Select id="organization-skill-course" value={courseId ?? "all"} onChange={(event) => updateQuery({ course: event.target.value === "all" ? null : event.target.value })}><option value="all">All published courses</option>{snapshot.courses.filter((course) => course.status === "published").map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</Select></Field>
            <Field><FieldLabel htmlFor="organization-skill-range">Time range</FieldLabel><Select id="organization-skill-range" value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{Object.entries(analyticsTimeRangeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
            <Field><FieldLabel htmlFor="organization-skill-coverage">Coverage</FieldLabel><Select id="organization-skill-coverage" value={coverage} onChange={(event) => updateQuery({ coverage: event.target.value === "all" ? null : event.target.value })}>{coverageOptions.map((item) => <option key={item} value={item}>{item === "all" ? "All coverage levels" : coverageLabels[item]}</option>)}</Select></Field>
          </Card>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Summary icon={Target} label="Measured skills" value={String(snapshot.skills.length)} />
            <Summary icon={Users} label="Verified skill records" value={String(snapshot.totals.verifiedSkills)} />
            <Summary icon={TrendingUp} label="Average improvement" value={`+${snapshot.totals.averageImprovement} points`} />
            <Summary icon={CircleAlert} label="Needs attention" value={String(needsAttention)} />
          </dl>

          {visibleSkills.length === 0 ? <OrganizationEmpty title="No skill outcomes match these filters" description={courseId ? "This course has no measured skill activity in the selected view." : "Choose another coverage level or time range."} /> : <section className="mt-10" aria-labelledby="aggregate-skill-outcomes"><div className="mb-4"><h2 id="aggregate-skill-outcomes" className="type-title-large">Aggregate skill outcomes</h2><p className="type-body-small mt-1 text-text-secondary">Coverage combines post-learning performance, practical pass rate, and retry signals using Function 17’s deterministic attention rules.</p></div><div className="grid gap-4 md:grid-cols-2">{visibleSkills.map((skill) => <Card key={skill.skillId} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-text-primary">{skill.name}</h3><p className="type-caption mt-1 text-text-tertiary">{skill.learnerCount} learners represented</p></div><Badge variant={skill.coverage === "strong" ? "success" : skill.coverage === "needs-attention" ? "warning" : "info"}>{coverageLabels[skill.coverage]}</Badge></div><Progress value={skill.postScore} label="Post-learning average" showValue className="mt-5" /><dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border-default pt-4"><Metric label="Pre-Assessment" value={`${skill.preScore}%`} /><Metric label="Average improvement" value={`+${skill.improvement} points`} /><Metric label="Practical pass" value={`${skill.practicalPassRate}%`} /><Metric label="Retry rate" value={`${skill.retryRate}%`} /></dl>{skill.coverage === "needs-attention" && <div className="type-body-small mt-5 rounded-md bg-yellow-50 p-3 text-neutral-700"><strong className="block text-text-primary">Observed challenge</strong><span className="mt-1 block">{skill.commonChallenge}</span></div>}</Card>)}</div></section>}
        </>
      )}
    </ContentContainer>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <Card className="p-5"><dt className="flex items-center gap-2 text-sm font-medium text-text-secondary"><Icon className="size-4 text-action-primary" aria-hidden="true" />{label}</dt><dd className="mt-3 text-2xl font-semibold tracking-tight">{value}</dd></Card>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}
