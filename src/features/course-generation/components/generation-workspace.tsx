"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, Check, Circle, FileCheck2, Layers3, RefreshCw, Sparkles } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { analysisTopics, generationSteps } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { getCourse, type ApiCourse } from "@/features/courses/api/course-api";
import { useCourseSetup } from "@/features/course-setup/components/course-setup-provider";
import {
  generateCourseWithTyphoon,
  getCourseGenerationStatus,
} from "@/features/course-generation/api/course-generation-api";
import { loadGeneratedCourse, completeMockGeneration } from "@/features/course-generation/services/course-generation-service";
import { hasCompletedAnalysis } from "@/features/knowledge-analysis/lib/analysis-store";
import { getKnowledgeSources } from "@/features/knowledge-sources/api/document-api";
import { ApiError } from "@/lib/api/api-client";
import { cn } from "@/lib/cn";
import { isFrontendBypassEnabled } from "@/lib/config";
import { readMockSources } from "@/lib/mock/source-store";

type GenerationPhase = "checking" | "entry" | "generating" | "failed";

function backendIdFor(courseId: string) {
  return /^\d+$/.test(courseId) ? Number(courseId) : null;
}

function levelForApiCourse(level: ApiCourse["difficulty_level"]) {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

function objectivesForApiCourse(course: ApiCourse) {
  return course.learning_objective.split("\n").map((objective) => objective.trim()).filter(Boolean);
}

export function GenerationWorkspace({ courseId, simulateFailure = false }: { courseId: string; simulateFailure?: boolean }) {
  const router = useRouter();
  const { course } = useCourseSetup();
  const backendCourseId = backendIdFor(courseId);
  const isApiCourse = backendCourseId !== null;
  const [phase, setPhase] = useState<GenerationPhase>("checking");
  const [activeStep, setActiveStep] = useState(0);
  const [failThisRun, setFailThisRun] = useState(simulateFailure);
  const [readySourceCount, setReadySourceCount] = useState(0);
  const [readyChunkCount, setReadyChunkCount] = useState(0);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [apiCourse, setApiCourse] = useState<ApiCourse | null>(null);
  const [apiDraftExists, setApiDraftExists] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const completingRef = useRef(false);

  useEffect(() => {
    if (backendCourseId !== null) {
      const session = getAuthSession();
      if (!session || session.mode !== "api") {
        router.push("/sign-in");
        return;
      }

      let cancelled = false;
      void Promise.all([
        getCourse(backendCourseId, session.accessToken),
        getKnowledgeSources(backendCourseId, session.accessToken),
        getCourseGenerationStatus(backendCourseId, session.accessToken),
      ]).then(([loadedCourse, sources, generationStatus]) => {
        if (cancelled) return;
        setApiCourse(loadedCourse);
        setReadySourceCount(sources.filter((source) => source.status === "READY").length);
        setReadyChunkCount(sources.reduce((total, source) => total + (source.chunk_count ?? 0), 0));
        setApiDraftExists(generationStatus.has_learning_path);
        setApiError(generationStatus.status === "FAILED" ? generationStatus.error : null);
        setAnalysisReady(true);
        setPhase("entry");
      }).catch((error) => {
        if (cancelled) return;
        setApiError(error instanceof ApiError ? error.message : "We couldn’t load this course’s generation status.");
        setPhase("failed");
      });
      return () => { cancelled = true; };
    }

    const timer = window.setTimeout(() => {
      const sources = readMockSources(courseId);
      setReadySourceCount(sources.filter((source) => source.status === "Ready").length);
      setAnalysisReady(isFrontendBypassEnabled || hasCompletedAnalysis(courseId) || Boolean(loadGeneratedCourse(courseId)));
      setPhase("entry");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [backendCourseId, courseId, router]);

  useEffect(() => {
    if (isApiCourse || phase !== "generating") return;
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
  }, [activeStep, courseId, failThisRun, isApiCourse, phase, router]);

  function startGeneration() {
    if (backendCourseId === null) {
      completingRef.current = false;
      setActiveStep(0);
      setPhase("generating");
      return;
    }
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      router.push("/sign-in");
      return;
    }
    setApiError(null);
    setPhase("generating");
    void generateCourseWithTyphoon(backendCourseId, session.accessToken)
      .then(() => router.push(`/creator/courses/${courseId}/generated`))
      .catch((error) => {
        setApiError(error instanceof ApiError ? error.message : "Course generation couldn’t be completed.");
        setPhase("failed");
      });
  }

  if (phase === "checking") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Checking generation readiness…</div></ContentContainer>;
  if (!analysisReady || readySourceCount === 0) return <GenerationDependency courseId={courseId} hasAnalysis={analysisReady} hasSources={readySourceCount > 0} requiresAnalysis={!isApiCourse} />;
  if (phase === "failed") return <GenerationFailure courseId={courseId} backToSources={isApiCourse} message={apiError ?? undefined} onRetry={() => { if (isApiCourse) startGeneration(); else { completingRef.current = false; setFailThisRun(false); setActiveStep(0); setPhase("generating"); } }} />;
  if (phase === "generating") return isApiCourse ? <ApiGenerationProgress courseName={apiCourse?.title ?? "your course"} /> : <GenerationProgress courseName={course.name} activeStep={activeStep} />;

  const title = apiCourse?.title ?? course.name;
  const description = apiCourse?.description ?? course.description;
  const targetLearner = apiCourse?.target_learner ?? course.targetLearner;
  const level = apiCourse ? levelForApiCourse(apiCourse.difficulty_level) : course.level;
  const objectives = apiCourse ? objectivesForApiCourse(apiCourse) : course.objectives;
  const existingCourse = !isApiCourse && loadGeneratedCourse(courseId);
  const outputs = isApiCourse
    ? ["Source-grounded overview", "Modules and lessons", "Lesson summaries", "Source chunk citations"]
    : ["Course outline", "Modules and lessons", "Exercises", "Quizzes", "Practical task", "Final assessment"];

  return (
    <ContentContainer className="max-w-[82rem]">
      <PageHeader eyebrow={isApiCourse ? "Typhoon generation" : "Digital Marketing Foundations"} title="AI Course Generator" description="Turn processed source chunks into a reviewable learning-path draft." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: title }, { label: "Generate" }]} actions={<Badge variant="accent"><Sparkles className="size-3.5" aria-hidden="true" />{isApiCourse ? "Typhoon API" : "Frontend AI simulation"}</Badge>} />
      {isApiCourse && apiError && <Card className="mt-6 border-yellow-200 bg-yellow-50 p-4"><p className="type-body-small text-neutral-800">Previous generation failed: {apiError}</p></Card>}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden shadow-sm">
          <div className="border-b border-border-default bg-blue-800 p-6 text-white sm:p-8"><Badge variant="accent">Ready to generate</Badge><h2 className="type-h2 mt-4">{title}</h2><p className="mt-3 max-w-2xl text-blue-100">{description}</p></div>
          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <Summary label="Knowledge sources" value={`${readySourceCount} ready`} icon={FileCheck2} />
            <Summary label={isApiCourse ? "Processed chunks" : "Topics extracted"} value={isApiCourse ? `${readyChunkCount} chunks` : `${analysisTopics.length} topics`} icon={Layers3} />
            <Summary label="Target learner" value={targetLearner} icon={BookOpenCheck} />
            <Summary label="Difficulty" value={level} icon={Sparkles} />
          </div>
          <div className="border-t border-border-default p-6 sm:p-8"><h3 className="type-title-large">Learning objectives</h3><ul className="mt-4 grid gap-3">{objectives.map((objective) => <li key={objective} className="flex gap-3 text-text-secondary"><Check className="mt-1 size-4 shrink-0 text-status-success" aria-hidden="true" />{objective}</li>)}</ul></div>
        </Card>
        <Card className="h-fit p-5 sm:p-6"><h2 className="type-title-large">{isApiCourse ? "Typhoon will create" : "AI will create"}</h2><ul className="mt-4 grid gap-3">{outputs.map((output) => <li key={output} className="flex items-center gap-3 text-text-secondary"><span className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-800"><Check className="size-3.5" aria-hidden="true" /></span>{output}</li>)}</ul><p className="type-body-small mt-5 rounded-md bg-yellow-50 p-3 text-neutral-700">Generated content must be reviewed and verified before publishing.</p></Card>
      </div>
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center"><ButtonLink href={`/creator/courses/${courseId}/${isApiCourse ? "sources" : "analysis"}`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to knowledge {isApiCourse ? "sources" : "analysis"}</ButtonLink><div className="flex flex-col items-stretch gap-2 sm:items-end">{isApiCourse && apiDraftExists ? <><p className="type-caption text-text-tertiary">A Typhoon draft is already stored for this course.</p><ButtonLink href={`/creator/courses/${courseId}/generated`} size="lg">View generated draft<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></> : <><p className="type-caption text-text-tertiary">{existingCourse ? "Generating again will replace the current frontend draft." : isApiCourse ? "Typhoon uses only your processed source chunks." : ""}</p><Button size="lg" onClick={startGeneration}>Generate course<Sparkles className="size-4" aria-hidden="true" /></Button></>}</div></div>
    </ContentContainer>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Sparkles }) {
  return <div className="rounded-lg border border-border-default p-4"><Icon className="size-5 text-action-primary" aria-hidden="true" /><p className="type-caption mt-3 font-semibold tracking-wide text-text-tertiary uppercase">{label}</p><p className="mt-1 text-sm font-medium text-text-primary">{value}</p></div>;
}

function ApiGenerationProgress({ courseName }: { courseName: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-blue-800 text-yellow-300 shadow-md"><Sparkles className="size-7 animate-pulse" aria-hidden="true" /></span><Badge variant="accent" className="mt-6">Typhoon AI generation</Badge><h1 className="type-h1 mt-4">Generating your course</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">Typhoon is creating a source-grounded learning path for {courseName}.</p><div role="status" className="mx-auto mt-8 flex items-center justify-center gap-3 text-text-secondary"><Spinner />Waiting for the secure backend response…</div><p className="type-caption mt-6 text-text-tertiary">Your course settings and processed sources remain safe if generation fails.</p></Card></ContentContainer>;
}

function GenerationProgress({ courseName, activeStep }: { courseName: string; activeStep: number }) {
  const progress = Math.round(((activeStep + 0.65) / generationSteps.length) * 100);
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-4xl items-center"><div className="w-full"><div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-blue-800 text-yellow-300 shadow-md"><Sparkles className="size-7 animate-pulse" aria-hidden="true" /></span><Badge variant="accent" className="mt-6">AI course generation</Badge><h1 className="type-h1 mt-4">Generating your course</h1><p className="type-body-large mx-auto mt-3 max-w-2xl text-text-secondary">SkillSync is turning your verified knowledge structure into a complete learning experience for {courseName}.</p></div><Card className="mx-auto mt-9 max-w-3xl overflow-hidden border-blue-200 shadow-md"><div className="bg-blue-800 px-6 py-5 text-white"><div className="flex items-center justify-between gap-4"><span className="font-semibold">Building course content</span><span className="text-xl font-semibold">{progress}%</span></div><Progress value={progress} size="sm" className="mt-3 [&_[role=progressbar]]:bg-white/15 [&_[role=progressbar]>div]:bg-yellow-300" /></div><ol className="divide-y divide-border-default p-3 sm:p-5">{generationSteps.map((step, index) => { const complete = index < activeStep; const current = index === activeStep; return <li key={step} className={cn("flex items-center gap-4 rounded-md px-3 py-3.5", current && "bg-blue-50")}><span className={cn("flex size-8 items-center justify-center rounded-full border", complete && "border-status-success bg-status-success text-white", current && "border-action-primary text-action-primary ring-4 ring-blue-100", !complete && !current && "border-border-default text-text-tertiary")}>{complete ? <Check className="size-4" aria-hidden="true" /> : current ? <Sparkles className="size-4 animate-pulse" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}</span><span className={cn("font-medium", !complete && !current && "text-text-tertiary")}>{step}</span>{current && <span className="type-caption ml-auto hidden text-action-primary sm:block">In progress</span>}</li>; })}</ol></Card><p className="type-caption mt-5 text-center text-text-tertiary">This frontend simulation does not call an AI service. Your course setup and sources remain safe.</p></div></ContentContainer>;
}

function GenerationFailure({ courseId, onRetry, message, backToSources = false }: { courseId: string; onRetry: () => void; message?: string; backToSources?: boolean }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-status-error"><AlertTriangle className="size-6" aria-hidden="true" /></span><Badge variant="error" className="mt-5">Generation failed</Badge><h1 className="type-h1 mt-4">Course generation couldn’t be completed</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">{message ?? "Your knowledge sources, analysis, and course setup are safe. Retry generation or return to the analysis workspace."}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/${backToSources ? "sources" : "analysis"}`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to knowledge {backToSources ? "sources" : "analysis"}</ButtonLink><Button onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry generation</Button></div></Card></ContentContainer>;
}

function GenerationDependency({ courseId, hasAnalysis, hasSources, requiresAnalysis }: { courseId: string; hasAnalysis: boolean; hasSources: boolean; requiresAnalysis: boolean }) {
  const destination = hasSources ? `/creator/courses/${courseId}/analysis` : `/creator/courses/${courseId}/sources`;
  const message = !hasSources
    ? "Process at least one TXT, Markdown, or selectable-text PDF source before generating a course."
    : requiresAnalysis && !hasAnalysis
      ? "Complete AI knowledge analysis before generating course content."
      : "The course is not ready for generation.";
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><AlertTriangle className="size-6" aria-hidden="true" /></span><h1 className="type-h1 mt-5">Finish the knowledge step first</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">{message}</p><ButtonLink href={destination} className="mt-7">{hasSources ? "Open knowledge analysis" : "Add knowledge sources"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
