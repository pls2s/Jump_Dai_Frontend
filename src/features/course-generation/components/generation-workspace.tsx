"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, Check, Circle, FileCheck2, Layers3, RefreshCw, Sparkles } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { analysisTopics, generationSteps } from "@/data/mock";
import { useCourseSetup } from "@/features/course-setup/components/course-setup-provider";
import { loadGeneratedCourse, completeMockGeneration } from "@/features/course-generation/services/course-generation-service";
import { hasCompletedAnalysis } from "@/features/knowledge-analysis/lib/analysis-store";
import { cn } from "@/lib/cn";
import { isFrontendBypassEnabled } from "@/lib/config";
import { readMockSources } from "@/lib/mock/source-store";

type GenerationPhase = "checking" | "entry" | "generating" | "failed";

export function GenerationWorkspace({ courseId, simulateFailure = false }: { courseId: string; simulateFailure?: boolean }) {
  const router = useRouter();
  const { course } = useCourseSetup();
  const [phase, setPhase] = useState<GenerationPhase>("checking");
  const [activeStep, setActiveStep] = useState(0);
  const [failThisRun, setFailThisRun] = useState(simulateFailure);
  const [readySourceCount, setReadySourceCount] = useState(0);
  const [analysisReady, setAnalysisReady] = useState(false);
  const completingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const sources = readMockSources(courseId);
      setReadySourceCount(sources.filter((source) => source.status === "Ready").length);
      setAnalysisReady(isFrontendBypassEnabled || hasCompletedAnalysis(courseId) || Boolean(loadGeneratedCourse(courseId)));
      setPhase("entry");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId]);

  useEffect(() => {
    if (phase !== "generating") return;
    const timer = window.setTimeout(() => {
      if (failThisRun && activeStep === 3) {
        setPhase("failed");
        return;
      }
      if (activeStep < generationSteps.length - 1) {
        setActiveStep((current) => current + 1);
        return;
      }
      if (completingRef.current) return;
      completingRef.current = true;
      void completeMockGeneration(courseId).then(() => router.push(`/creator/courses/${courseId}/generated`));
    }, activeStep === generationSteps.length - 1 ? 650 : 620);
    return () => window.clearTimeout(timer);
  }, [activeStep, courseId, failThisRun, phase, router]);

  if (phase === "checking") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Checking generation readiness…</div></ContentContainer>;
  if (!analysisReady || readySourceCount === 0) return <GenerationDependency courseId={courseId} hasAnalysis={analysisReady} hasSources={readySourceCount > 0} />;
  if (phase === "failed") return <GenerationFailure courseId={courseId} onRetry={() => { completingRef.current = false; setFailThisRun(false); setActiveStep(0); setPhase("generating"); }} />;
  if (phase === "generating") return <GenerationProgress courseName={course.name} activeStep={activeStep} />;

  const existingCourse = loadGeneratedCourse(courseId);
  const outputs = ["Course outline", "Modules and lessons", "Exercises", "Quizzes", "Practical task", "Final assessment"];
  return (
    <ContentContainer className="max-w-[82rem]">
      <PageHeader eyebrow="Digital Marketing Foundations" title="AI Course Generator" description="Turn the verified knowledge structure into a complete, reviewable learning experience." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: course.name }, { label: "Generate" }]} actions={<Badge variant="accent"><Sparkles className="size-3.5" aria-hidden="true" />Frontend AI simulation</Badge>} />
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden shadow-sm">
          <div className="border-b border-border-default bg-blue-800 p-6 text-white sm:p-8"><Badge variant="accent">Ready to generate</Badge><h2 className="type-h2 mt-4">{course.name}</h2><p className="mt-3 max-w-2xl text-blue-100">SkillSync will map the analyzed topics to your learning objectives, then build activities and assessments for Creator review.</p></div>
          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <Summary label="Knowledge sources" value={`${readySourceCount} ready`} icon={FileCheck2} />
            <Summary label="Topics extracted" value={`${analysisTopics.length} topics`} icon={Layers3} />
            <Summary label="Target learner" value={course.targetLearner} icon={BookOpenCheck} />
            <Summary label="Difficulty" value={course.level} icon={Sparkles} />
          </div>
          <div className="border-t border-border-default p-6 sm:p-8"><h3 className="type-title-large">Learning objectives</h3><ul className="mt-4 grid gap-3">{course.objectives.map((objective) => <li key={objective} className="flex gap-3 text-text-secondary"><Check className="mt-1 size-4 shrink-0 text-status-success" aria-hidden="true" />{objective}</li>)}</ul></div>
        </Card>
        <Card className="h-fit p-5 sm:p-6"><h2 className="type-title-large">AI will create</h2><ul className="mt-4 grid gap-3">{outputs.map((output) => <li key={output} className="flex items-center gap-3 text-text-secondary"><span className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-800"><Check className="size-3.5" aria-hidden="true" /></span>{output}</li>)}</ul><p className="type-body-small mt-5 rounded-md bg-yellow-50 p-3 text-neutral-700">Generated content must be reviewed and verified before publishing.</p></Card>
      </div>
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center"><ButtonLink href={`/creator/courses/${courseId}/analysis`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to knowledge analysis</ButtonLink><div className="flex flex-col items-stretch gap-2 sm:items-end">{existingCourse && <p className="type-caption text-text-tertiary">Generating again will replace the current frontend draft.</p>}<Button size="lg" onClick={() => { completingRef.current = false; setActiveStep(0); setPhase("generating"); }}>{existingCourse ? "Generate course again" : "Generate course"}<Sparkles className="size-4" aria-hidden="true" /></Button></div></div>
    </ContentContainer>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Sparkles }) {
  return <div className="rounded-lg border border-border-default p-4"><Icon className="size-5 text-action-primary" aria-hidden="true" /><p className="type-caption mt-3 font-semibold tracking-wide text-text-tertiary uppercase">{label}</p><p className="mt-1 text-sm font-medium text-text-primary">{value}</p></div>;
}

function GenerationProgress({ courseName, activeStep }: { courseName: string; activeStep: number }) {
  const progress = Math.round(((activeStep + 0.65) / generationSteps.length) * 100);
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-4xl items-center"><div className="w-full"><div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-blue-800 text-yellow-300 shadow-md"><Sparkles className="size-7 animate-pulse" aria-hidden="true" /></span><Badge variant="accent" className="mt-6">AI course generation</Badge><h1 className="type-h1 mt-4">Generating your course</h1><p className="type-body-large mx-auto mt-3 max-w-2xl text-text-secondary">SkillSync is turning your verified knowledge structure into a complete learning experience for {courseName}.</p></div><Card className="mx-auto mt-9 max-w-3xl overflow-hidden border-blue-200 shadow-md"><div className="bg-blue-800 px-6 py-5 text-white"><div className="flex items-center justify-between gap-4"><span className="font-semibold">Building course content</span><span className="text-xl font-semibold">{progress}%</span></div><Progress value={progress} size="sm" className="mt-3 [&_[role=progressbar]]:bg-white/15 [&_[role=progressbar]>div]:bg-yellow-300" /></div><ol className="divide-y divide-border-default p-3 sm:p-5">{generationSteps.map((step, index) => { const complete = index < activeStep; const current = index === activeStep; return <li key={step} className={cn("flex items-center gap-4 rounded-md px-3 py-3.5", current && "bg-blue-50")}><span className={cn("flex size-8 items-center justify-center rounded-full border", complete && "border-status-success bg-status-success text-white", current && "border-action-primary text-action-primary ring-4 ring-blue-100", !complete && !current && "border-border-default text-text-tertiary")}>{complete ? <Check className="size-4" aria-hidden="true" /> : current ? <Sparkles className="size-4 animate-pulse" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}</span><span className={cn("font-medium", !complete && !current && "text-text-tertiary")}>{step}</span>{current && <span className="type-caption ml-auto hidden text-action-primary sm:block">In progress</span>}</li>; })}</ol></Card><p className="type-caption mt-5 text-center text-text-tertiary">This frontend simulation does not call an AI service. Your course setup and sources remain safe.</p></div></ContentContainer>;
}

function GenerationFailure({ courseId, onRetry }: { courseId: string; onRetry: () => void }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-status-error"><AlertTriangle className="size-6" aria-hidden="true" /></span><Badge variant="error" className="mt-5">Generation failed</Badge><h1 className="type-h1 mt-4">Course generation couldn’t be completed</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">Your knowledge sources, analysis, and course setup are safe. Retry generation or return to the analysis workspace.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/analysis`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to knowledge analysis</ButtonLink><Button onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry generation</Button></div></Card></ContentContainer>;
}

function GenerationDependency({ courseId, hasAnalysis, hasSources }: { courseId: string; hasAnalysis: boolean; hasSources: boolean }) {
  const destination = hasSources ? `/creator/courses/${courseId}/analysis` : `/creator/courses/${courseId}/sources`;
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><AlertTriangle className="size-6" aria-hidden="true" /></span><h1 className="type-h1 mt-5">Finish the knowledge step first</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">{!hasSources ? "Add at least one Ready knowledge source before generating a course." : !hasAnalysis ? "Complete AI knowledge analysis before generating course content." : "The course is not ready for generation."}</p><ButtonLink href={destination} className="mt-7">{hasSources ? "Open knowledge analysis" : "Add knowledge sources"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
