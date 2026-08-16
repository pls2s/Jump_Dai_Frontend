"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, FileText, Flag, Lightbulb, ListTree, Menu, Target } from "lucide-react";

import { ContentContainer } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { beginLessonProgress, completeLesson, loadLearningExperience } from "@/features/learner-journey/services/learning-experience-service";
import type { LearnerJourneyState, LearnerLesson, LearningPathItemEmphasis } from "@/features/learner-journey/types";
import { cn } from "@/lib/cn";

const emphasisBadge: Record<LearningPathItemEmphasis, { label: string; variant: "warning" | "info" | "success" }> = {
  priority: { label: "Priority · Practice more", variant: "warning" },
  recommended: { label: "Recommended", variant: "info" },
  "quick-refresher": { label: "Quick refresher", variant: "success" },
};

export function LearningWorkspace({ courseId, courseTitle, requestedLessonId }: { courseId: string; courseTitle: string; requestedLessonId?: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);
  const [lessons, setLessons] = useState<LearnerLesson[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      const loaded = loadLearningExperience(session.user.id, courseId, "path-ready");
      setJourney(loaded.journey);
      setLessons(loaded.lessons);
      const selectedId = requestedLessonId ?? loaded.journey.learningProgress?.currentLessonId ?? loaded.lessons[0]?.id;
      if (selectedId && loaded.lessons.some((lesson) => lesson.id === selectedId)) {
        setJourney(beginLessonProgress(session.user.id, courseId, loaded.journey, selectedId));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, requestedLessonId, router]);

  const selectedLessonId = requestedLessonId ?? journey?.learningProgress?.currentLessonId ?? lessons[0]?.id;
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);
  const selectedIndex = lessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const nextLesson = lessons[selectedIndex + 1];
  const completedIds = journey?.learningProgress?.completedLessonIds ?? [];
  const courseProgress = lessons.length ? Math.round((completedIds.length / lessons.length) * 100) : 0;
  const grouped = useMemo(() => {
    const groups: Array<{ pathItemId: string; moduleTitle: string; lessons: LearnerLesson[] }> = [];
    lessons.forEach((lesson) => {
      const current = groups.find((group) => group.pathItemId === lesson.pathItemId);
      if (current) current.lessons.push(lesson);
      else groups.push({ pathItemId: lesson.pathItemId, moduleTitle: lesson.moduleTitle, lessons: [lesson] });
    });
    return groups;
  }, [lessons]);

  function markComplete() {
    if (!journey || !selectedLesson) return;
    const session = getAuthSession();
    if (!session) return;
    setJourney(completeLesson(session.user.id, courseId, journey, selectedLesson.id, lessons));
  }

  if (!journey) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Opening your learning experience…</div></ContentContainer>;

  if (!journey.learningPath || !lessons.length) return <Recovery title="Your learning path is needed" description="Build your personalized learning path before starting lessons." href={`/learner/courses/${courseId}/learning-path`} action="Back to learning path" />;
  if (!selectedLesson) return <Recovery title="This lesson isn’t available" description="It may no longer be part of your personalized sequence. Return to the learning path to choose an available lesson." href={`/learner/courses/${courseId}/learning-path`} action="Back to learning path" />;

  const isCompleted = completedIds.includes(selectedLesson.id);
  const quickAttempt = selectedLesson.quickCheckId ? journey.knowledgeChecks?.[selectedLesson.quickCheckId] : undefined;
  const primaryNextHref = selectedLesson.quickCheckId && !quickAttempt?.result
    ? `/learner/courses/${courseId}/quiz/${selectedLesson.quickCheckId}`
    : nextLesson
      ? `/learner/courses/${courseId}/learn/${nextLesson.id}`
      : `/learner/courses/${courseId}/post-assessment`;
  const primaryNextLabel = selectedLesson.quickCheckId && !quickAttempt?.result ? "Take quick quiz" : nextLesson ? "Next lesson" : "Final knowledge check";

  return (
    <ContentContainer className="max-w-[88rem]">
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border-default bg-surface-default p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="type-caption text-text-tertiary">{courseTitle}</p><p className="font-semibold">Learning experience</p></div>
        <div className="min-w-56"><Progress value={courseProgress} label="Course progress" showValue size="sm" /></div>
      </div>

      <details className="mb-5 rounded-lg border border-border-default bg-surface-default lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30"><Menu className="size-5" aria-hidden="true" />Learning path navigation</summary>
        <div className="border-t border-border-default p-3"><LearningNavigation groups={grouped} courseId={courseId} selectedLessonId={selectedLesson.id} completedIds={completedIds} /></div>
      </details>

      <div className="grid gap-7 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2" aria-label="Learning path">
          <div className="mb-4 flex items-center gap-2"><ListTree className="size-5 text-blue-800" aria-hidden="true" /><h2 className="font-semibold">Your learning path</h2></div>
          <LearningNavigation groups={grouped} courseId={courseId} selectedLessonId={selectedLesson.id} completedIds={completedIds} />
        </aside>

        <main className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><Badge variant={emphasisBadge[selectedLesson.emphasis].variant}>{emphasisBadge[selectedLesson.emphasis].label}</Badge>{isCompleted && <Badge variant="success"><CheckCircle2 className="size-3.5" aria-hidden="true" />Completed</Badge>}</div>
          <p className="type-label mt-5 text-action-primary">{selectedLesson.moduleTitle}</p>
          <h1 className="type-h1 mt-2 max-w-4xl">{selectedLesson.title}</h1>
          <div className="type-body-small mt-4 flex flex-wrap gap-x-5 gap-y-2 text-text-secondary"><span className="flex items-center gap-1.5"><Clock3 className="size-4" aria-hidden="true" />{selectedLesson.estimatedMinutes} min</span><span className="flex items-center gap-1.5"><Target className="size-4" aria-hidden="true" />{selectedLesson.learningObjective}</span></div>

          <Card className="mt-6 border-blue-200 bg-blue-50 p-4 sm:p-5"><p className="type-label text-blue-900">Why this is in your path</p><p className="type-body-small mt-1 text-blue-900">{selectedLesson.personalizationReason}</p></Card>

          <div className="mt-7 grid gap-6">
            <LessonSection icon={Target} title="Learning objective"><p>{selectedLesson.learningObjective}</p></LessonSection>
            <LessonSection icon={BookOpen} title="Short explanation"><p>{selectedLesson.summary}</p></LessonSection>
            <LessonSection icon={Lightbulb} title="Key concepts"><ul className="grid gap-2 sm:grid-cols-2">{selectedLesson.keyConcepts.map((concept) => <li key={concept} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-status-success" aria-hidden="true" />{concept}</li>)}</ul></LessonSection>
            <LessonSection icon={Flag} title="Example"><p>{selectedLesson.example}</p></LessonSection>
            {selectedLesson.practicePrompt && <LessonSection icon={BookOpen} title="Practice prompt"><p>{selectedLesson.practicePrompt}</p></LessonSection>}
            {selectedLesson.sourceNames.length > 0 && <div className="type-body-small flex flex-wrap items-center gap-2 text-text-secondary"><FileText className="size-4" aria-hidden="true" /><span>Learned from:</span>{selectedLesson.sourceNames.map((source) => <Badge key={source} variant="neutral">{source}</Badge>)}</div>}
          </div>

          <Card className="mt-8 p-5 sm:p-6"><h2 className="type-title-large">Lesson summary</h2><p className="mt-2 text-text-secondary">Use the objective, audience need, and intended action to keep every campaign decision connected and measurable.</p></Card>

          <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <ButtonLink href={`/learner/courses/${courseId}/learning-path`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Learning path</ButtonLink>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isCompleted && <Button onClick={markComplete}>Mark lesson complete<CheckCircle2 className="size-4" aria-hidden="true" /></Button>}
              {isCompleted && <ButtonLink href={primaryNextHref}>{primaryNextLabel}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}
            </div>
          </div>
        </main>
      </div>
    </ContentContainer>
  );
}

function LearningNavigation({ groups, courseId, selectedLessonId, completedIds }: { groups: Array<{ pathItemId: string; moduleTitle: string; lessons: LearnerLesson[] }>; courseId: string; selectedLessonId: string; completedIds: string[] }) {
  return <nav className="grid gap-3">{groups.map((group, index) => <div key={group.pathItemId}><p className="type-caption px-2 text-text-tertiary">Path {index + 1}</p><p className="px-2 py-1 text-sm font-semibold">{group.moduleTitle}</p><div className="mt-1 grid gap-1">{group.lessons.map((lesson) => { const selected = lesson.id === selectedLessonId; const complete = completedIds.includes(lesson.id); return <a key={lesson.id} href={`/learner/courses/${courseId}/learn/${lesson.id}`} aria-current={selected ? "page" : undefined} className={cn("flex min-h-11 items-center gap-2 rounded-md border-l-3 px-2.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30", selected ? "border-blue-700 bg-blue-50 font-semibold text-blue-950" : "border-transparent text-text-secondary hover:bg-neutral-50")}><span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", complete ? "border-status-success bg-status-success text-white" : "border-border-strong")} >{complete && <Check className="size-3" aria-hidden="true" />}</span><span className="min-w-0 flex-1 line-clamp-2">{lesson.title}</span>{lesson.quickCheckId && <span className="sr-only">Includes quiz</span>}</a>; })}</div></div>)}</nav>;
}

function LessonSection({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return <section className="border-b border-border-default pb-6 last:border-0"><div className="flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-md bg-blue-100 text-blue-800"><Icon className="size-4.5" aria-hidden="true" /></span><h2 className="type-title-large">{title}</h2></div><div className="mt-4 max-w-4xl leading-7 text-text-secondary">{children}</div></section>;
}

function Recovery({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return <ContentContainer className="max-w-4xl"><Card className="mt-8 p-6 sm:p-8"><span className="flex size-11 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><BookOpen className="size-5" aria-hidden="true" /></span><h1 className="type-h1 mt-5">{title}</h1><p className="type-body-large mt-3 text-text-secondary">{description}</p><ButtonLink href={href} className="mt-6">{action}<ChevronRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
