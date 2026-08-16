"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  Gauge,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { loadLearningProfile } from "@/features/learner-onboarding/services/learning-profile-service";
import { loadLearnerJourney, savePersonalizedPath } from "@/features/learner-journey/services/learner-journey-service";
import type { LearnerLearningProfile } from "@/features/learner-onboarding/types";
import type { LearnerJourneyState, LearningPathItemEmphasis, PersonalizedLearningPath } from "@/features/learner-journey/types";
import { createPersonalizedLearningPath, formatLearningTime } from "@/features/personalized-learning/lib/path-generator";
import { cn } from "@/lib/cn";

type ScreenState = "loading" | "missing-profile" | "missing-assessment" | "generating" | "failed" | "ready";

const generationSteps = [
  "Reading your assessment results",
  "Prioritizing skill gaps",
  "Selecting the right lessons",
  "Adjusting learning sequence",
  "Preparing your learning path",
];

const emphasisCopy: Record<LearningPathItemEmphasis, { label: string; variant: "warning" | "info" | "success" }> = {
  priority: { label: "Priority · Practice more", variant: "warning" },
  recommended: { label: "Recommended", variant: "info" },
  "quick-refresher": { label: "Quick refresher · Already strong", variant: "success" },
};

export function LearningPathWorkspace({
  courseId,
  courseTitle,
  previewView,
  previewState,
}: {
  courseId: string;
  courseTitle: string;
  previewView?: string;
  previewState?: string;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenState>("loading");
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);
  const [profile, setProfile] = useState<LearnerLearningProfile | null>(null);
  const [path, setPath] = useState<PersonalizedLearningPath | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      const loadedProfile = loadLearningProfile(session.user.id, courseId);
      const loadedJourney = loadLearnerJourney(session.user.id, courseId, "completed");
      setProfile(loadedProfile);
      setJourney(loadedJourney);
      setPath(loadedJourney.learningPath ?? null);
      if (!loadedProfile) setScreen("missing-profile");
      else if (!loadedJourney.result || loadedJourney.assessment?.status !== "completed") setScreen("missing-assessment");
      else if (previewState === "failed") setScreen("failed");
      else if (previewView === "generating") setScreen("generating");
      else if (loadedJourney.learningPath) setScreen("ready");
      else if (previewView === "result") {
        const generated = createPersonalizedLearningPath(loadedProfile, loadedJourney.result);
        setPath(generated);
        setJourney(savePersonalizedPath(session.user.id, courseId, generated));
        setScreen("ready");
      } else setScreen("generating");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, previewState, previewView, router]);

  const completeGeneration = useCallback(() => {
    if (!profile || !journey?.result) return;
    const session = getAuthSession();
    if (!session) return;
    const generated = createPersonalizedLearningPath(
      profile,
      journey.result,
      journey.learningPath?.pathVersion ?? 0,
    );
    setPath(generated);
    setJourney(savePersonalizedPath(session.user.id, courseId, generated));
    setScreen("ready");
    router.replace(`/learner/courses/${courseId}/learning-path`);
  }, [courseId, journey, profile, router]);

  useEffect(() => {
    if (screen !== "generating") return;
    if (generationStep >= generationSteps.length) {
      const timer = window.setTimeout(completeGeneration, 450);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setGenerationStep((current) => current + 1), 520);
    return () => window.clearTimeout(timer);
  }, [completeGeneration, generationStep, screen]);

  function retry() {
    setGenerationStep(0);
    setScreen("generating");
  }

  if (screen === "loading") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading your learning plan…</div></ContentContainer>;

  if (screen === "missing-profile" || screen === "missing-assessment") {
    const missingProfile = screen === "missing-profile";
    return (
      <ContentContainer className="max-w-4xl">
        <PageHeader eyebrow={courseTitle} title={missingProfile ? "Learning preferences needed" : "Pre-assessment needed"} description={missingProfile ? "Tell us your goal and content preferences before building a personalized path." : "A personalized path must use completed assessment results, so finish the pre-assessment first."} />
        <Card className="mt-7 p-6 sm:p-8"><p className="text-text-secondary">No learning path has been generated. Your existing learner data is safe.</p><ButtonLink href={missingProfile ? `/learner/courses/${courseId}/learning-profile` : `/learner/courses/${courseId}/pre-assessment`} className="mt-5">{missingProfile ? "Complete learning preferences" : "Go to pre-assessment"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>
      </ContentContainer>
    );
  }

  if (screen === "failed") {
    return (
      <ContentContainer className="max-w-4xl">
        <Card className="mt-8 p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-status-error"><TriangleAlert className="size-6" aria-hidden="true" /></span>
          <Badge variant="error" className="mt-5">Generation paused</Badge>
          <h1 className="type-h1 mt-4">We couldn’t build your learning path</h1>
          <p className="type-body-large mt-3 max-w-2xl text-text-secondary">Your assessment results and learning preferences are safe. Try the generation again, or return to your skill snapshot.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Button onClick={retry}><RefreshCw className="size-4" aria-hidden="true" />Try again</Button><ButtonLink href={`/learner/courses/${courseId}/skill-gap`} variant="secondary">Back to skill snapshot</ButtonLink></div>
        </Card>
      </ContentContainer>
    );
  }

  if (screen === "generating") {
    return (
      <ContentContainer className="max-w-4xl">
        <div className="py-8 sm:py-14">
          <Badge variant="info"><Sparkles className="size-3.5" aria-hidden="true" />Personalizing</Badge>
          <h1 className="type-h1 mt-5">Building your learning path</h1>
          <p className="type-body-large mt-3 max-w-2xl text-text-secondary">SkillSync is combining your assessment priorities with your goal, learning preferences, and pace.</p>
          <Card className="mt-8 p-5 sm:p-7">
            <Progress value={Math.min(generationStep, generationSteps.length)} max={generationSteps.length} label="Path generation progress" showValue />
            <ol className="mt-7 grid gap-2" aria-live="polite">
              {generationSteps.map((step, index) => {
                const complete = index < generationStep;
                const active = index === generationStep;
                return <li key={step} className={cn("flex min-h-12 items-center gap-3 rounded-md px-3 py-2", active && "bg-blue-50 text-blue-900")}>{complete ? <CheckCircle2 className="size-5 shrink-0 text-status-success" aria-hidden="true" /> : active ? <Spinner className="size-5 shrink-0" /> : <Circle className="size-5 shrink-0 text-neutral-300" aria-hidden="true" />}<span className={cn("type-body-small", active && "font-semibold")}>{step}</span><span className="sr-only">{complete ? "Complete" : active ? "In progress" : "Waiting"}</span></li>;
              })}
            </ol>
          </Card>
        </div>
      </ContentContainer>
    );
  }

  if (!path) return null;
  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader
        eyebrow={`${courseTitle} · Path version ${path.pathVersion}`}
        title="Your personalized learning path"
        description="We’ve focused your path on the skills that need the most attention while keeping knowledge you already have concise."
        actions={<Badge variant="success"><CheckCircle2 className="size-3.5" aria-hidden="true" />Ready</Badge>}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat icon={Target} label="Focus areas" value={String(path.focusAreaCount)} />
        <SummaryStat icon={Route} label="Recommended modules" value={String(path.recommendedModuleCount)} />
        <SummaryStat icon={Clock3} label="Estimated time" value={formatLearningTime(path.estimatedMinutes)} />
        <SummaryStat icon={Gauge} label="Adapted for" value={`${path.pace[0].toUpperCase()}${path.pace.slice(1)} pace`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="path-heading">
          <div className="flex items-end justify-between gap-4"><div><h2 id="path-heading" className="type-title-large">Recommended learning order</h2><p className="type-body-small mt-1 text-text-secondary">Priority practice first, concise reinforcement later.</p></div></div>
          <ol className="mt-5 grid gap-4">
            {path.items.map((item) => {
              const copy = emphasisCopy[item.emphasis];
              return (
                <li key={item.id} className="relative pl-11 before:absolute before:top-10 before:bottom-[-1.25rem] before:left-[1.15rem] before:w-px before:bg-border-default last:before:hidden">
                  <span className={cn("absolute top-5 left-0 flex size-9 items-center justify-center rounded-full border-4 border-background-page text-xs font-semibold text-white", item.emphasis === "priority" ? "bg-blue-800" : item.emphasis === "recommended" ? "bg-blue-600" : "bg-neutral-500")}>{item.sequence}</span>
                  <Card className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><Badge variant={copy.variant}>{copy.label}</Badge><h3 className="type-title-large mt-3">{item.title}</h3></div><span className="type-body-small flex shrink-0 items-center gap-1.5 text-text-secondary"><Clock3 className="size-4" aria-hidden="true" />{item.estimatedMinutes} min</span></div>
                    <p className="type-body-small mt-3 text-text-secondary"><strong className="text-text-primary">Why this is here:</strong> {item.reason}</p>
                    <p className="type-caption mt-4 text-text-tertiary">Skill addressed</p><p className="type-body-small mt-1 font-medium">{item.skillAddressed}</p>
                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Learning activities">{item.activities.map((activity) => <Badge key={activity} variant="neutral">{activity}</Badge>)}</div>
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center gap-2"><BookOpenCheck className="size-5 text-blue-800" aria-hidden="true" /><h2 className="font-semibold">Why this path?</h2></div>
            <details className="group mt-4"><summary className="cursor-pointer text-sm font-semibold text-action-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30">See personalization details</summary><div className="type-body-small mt-3 space-y-3 text-text-secondary"><p><strong className="text-text-primary">Assessment:</strong> Lower-scoring areas appear first with more practice.</p><p><strong className="text-text-primary">Goal:</strong> {path.goalLabel}</p><p><strong className="text-text-primary">Preferences:</strong> {path.preferencesUsed.length ? path.preferencesUsed.join(", ").replaceAll("-", " ") : "Balanced course activities"}.</p><p><strong className="text-text-primary">Future updates:</strong> New assessment results may create a later path version.</p></div></details>
          </Card>
          <Card className="p-5"><p className="type-caption text-text-tertiary">Generated</p><p className="type-body-small mt-1 font-medium">{new Date(path.generatedAt).toLocaleString()}</p><p className="type-caption mt-4 text-text-tertiary">Evidence</p><p className="type-body-small mt-1">Pre-assessment {path.sourceAssessmentId}</p></Card>
        </aside>
      </div>

      <Card className="mt-8 flex flex-col items-start justify-between gap-5 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3"><Flag className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div><h2 className="font-semibold text-blue-950">Your path is ready</h2><p className="type-body-small mt-1 text-blue-900">Start with your highest-priority skill area. Progress tracking begins in Function 12.</p></div></div>
        <ButtonLink href={`/learner/courses/${courseId}/learn`} className="shrink-0">Start learning<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
      </Card>

      <div className="mt-6 flex justify-between"><ButtonLink href={`/learner/courses/${courseId}/skill-gap`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to skill snapshot</ButtonLink></div>
    </ContentContainer>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <Card className="p-4 sm:p-5"><span className="flex size-9 items-center justify-center rounded-md bg-blue-100 text-blue-800"><Icon className="size-4.5" aria-hidden="true" /></span><p className="type-caption mt-4 text-text-tertiary">{label}</p><p className="mt-1 font-semibold">{value}</p></Card>;
}
