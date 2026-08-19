"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Flag,
  ListChecks,
  Target,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { assessmentSkills } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { skillStatusLabel } from "@/features/learner-assessment/lib/assessment-config";
import { loadLearnerJourney } from "@/features/learner-journey/services/learner-journey-service";
import { ApiSkillGapWorkspace } from "@/features/personalized-learning/components/api-learning-flow";
import { useApiLearningMode } from "@/features/personalized-learning/lib/use-api-learning-mode";
import type { LearnerJourneyState, SkillLevelStatus } from "@/features/learner-journey/types";

const statusVariant: Record<SkillLevelStatus, "error" | "warning" | "info" | "success"> = {
  "needs-focus": "error",
  developing: "warning",
  proficient: "info",
  strong: "success",
};

export function SkillGapWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const mode = useApiLearningMode();
  if (mode === "loading") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing your skill snapshot…</div></ContentContainer>;
  if (mode === "api") return <ApiSkillGapWorkspace courseId={courseId} courseTitle={courseTitle} />;
  return <DemoSkillGapWorkspace courseId={courseId} courseTitle={courseTitle} />;
}

function DemoSkillGapWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      setJourney(loadLearnerJourney(session.user.id, courseId, "completed"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, router]);

  if (!journey) {
    return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing your skill snapshot…</div></ContentContainer>;
  }

  if (!journey.result || journey.assessment?.status !== "completed") {
    return (
      <ContentContainer className="max-w-4xl">
        <PageHeader eyebrow={courseTitle} title="Complete your pre-assessment first" description="Your skill snapshot needs assessment evidence before it can identify strengths and priority areas." />
        <Card className="mt-7 p-6 sm:p-8"><p className="text-text-secondary">Your saved learning preferences are safe. Finish the assessment to continue.</p><ButtonLink href={`/learner/courses/${courseId}/pre-assessment`} className="mt-5">Go to pre-assessment<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>
      </ContentContainer>
    );
  }

  const { result } = journey;
  const priorities = result.prioritySkillIds
    .map((id) => ({ skill: assessmentSkills.find((item) => item.id === id), score: result.skillScores.find((item) => item.skillId === id) }))
    .filter((item): item is { skill: NonNullable<typeof item.skill>; score: NonNullable<typeof item.score> } => Boolean(item.skill && item.score))
    .slice(0, 3);
  const strengths = result.strengthSkillIds
    .map((id) => ({ skill: assessmentSkills.find((item) => item.id === id), score: result.skillScores.find((item) => item.skillId === id) }))
    .filter((item): item is { skill: NonNullable<typeof item.skill>; score: NonNullable<typeof item.score> } => Boolean(item.skill && item.score));

  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader
        eyebrow={`${courseTitle} · Based on your pre-assessment`}
        title="Your skill snapshot"
        description="Here’s what you already know and where focused practice can help most. This is a starting point, not a pass or fail result."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="flex flex-col items-center justify-center p-6 text-center sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-800"><BarChart3 className="size-6" aria-hidden="true" /></span>
          <p className="type-caption mt-5 text-text-tertiary">Overall readiness</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-text-primary">{result.overallScore}%</p>
          <p className="type-body-small mt-3 max-w-52 text-text-secondary">Your path will spend more time where practice can help most.</p>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border-default p-5 sm:px-6"><h2 className="type-title-large">Competency summary</h2><p className="type-body-small mt-1 text-text-secondary">Scores combine the questions mapped to each skill.</p></div>
          <div className="divide-y divide-border-default">
            {result.skillScores.map((skill) => (
              <div key={skill.skillId} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center sm:px-6">
                <div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{skill.name}</h3><span className="text-sm font-semibold sm:hidden">{skill.score}%</span></div><Progress className="mt-2" value={skill.score} size="sm" label={`${skill.name} score`} /></div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><span className="hidden text-lg font-semibold sm:block">{skill.score}%</span><Badge variant={statusVariant[skill.status]}>{skillStatusLabel(skill.status)}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-yellow-100 text-neutral-800"><Target className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">Your priority areas</h2><p className="type-body-small mt-1 text-text-secondary">Topics below the 60% focus threshold.</p></div></div>
          <ol className="mt-6 grid gap-5">
            {priorities.map(({ skill, score }, index) => <li key={skill.id} className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-800 text-xs font-semibold text-white">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{skill.name}</h3><Badge variant="warning">{score.score}%</Badge></div><p className="type-body-small mt-1.5 text-text-secondary"><strong className="text-text-primary">Why it matters:</strong> {skill.whyItMatters}</p></div></li>)}
            {priorities.length === 0 && <li className="type-body-small text-text-secondary">No skill is below the focus threshold. Your path will emphasize concise reinforcement.</li>}
          </ol>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-green-100 text-status-success"><Award className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">Your strengths</h2><p className="type-body-small mt-1 text-text-secondary">Areas where you already show strong understanding.</p></div></div>
          <div className="mt-6 grid gap-4">
            {strengths.map(({ skill, score }) => <div key={skill.id} className="rounded-md bg-green-50 p-4"><div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-status-success" aria-hidden="true" /><h3 className="font-semibold">{skill.name}</h3><Badge variant="success" className="ml-auto">{score.score}%</Badge></div><p className="type-body-small mt-2 text-text-secondary">{skill.strengthMessage}</p></div>)}
            {strengths.length === 0 && <p className="type-body-small text-text-secondary">Your current results show developing knowledge across the course. Each area will receive guided support.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-7 flex flex-col items-start justify-between gap-5 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3"><Flag className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div><h2 className="font-semibold text-blue-950">Ready for a focused plan</h2><p className="type-body-small mt-1 max-w-2xl text-blue-900">Your learning goal, preferences, pace, and these assessment results will shape the recommended sequence.</p></div></div>
        <ButtonLink href={`/learner/courses/${courseId}/learning-path?view=generating`} className="shrink-0">Build my learning path<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
      </Card>

      <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <ButtonLink href={`/learner/courses/${courseId}/pre-assessment`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to assessment</ButtonLink>
        <ButtonLink href={`/learner/courses/${courseId}/skill-gap/review`} variant="secondary"><ListChecks className="size-4" aria-hidden="true" />Review assessment</ButtonLink>
      </div>
    </ContentContainer>
  );
}
