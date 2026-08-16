"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowRight, BookOpenCheck, Check, CheckCircle2, Circle, FileCheck2, Layers3, Link2, Network, Quote, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress } from "@/components/ui";
import { analysisSummary, analysisTopics, learningSequence, processingSteps } from "@/data/mock/product";
import { markAnalysisComplete } from "@/features/knowledge-analysis/lib/analysis-store";
import { SourceReferencesDrawer } from "@/features/source-grounding/components/source-references-drawer";
import { cn } from "@/lib/cn";
import { isFrontendBypassEnabled } from "@/lib/config";
import { readMockSources } from "@/lib/mock/source-store";
import type { Concept, SourceReference } from "@/types/product";

type AnalysisPhase = "running" | "failed" | "complete";

export function AnalysisWorkspace({ courseId, simulateFailure = false, previewState }: { courseId: string; simulateFailure?: boolean; previewState?: "processing" | "result" }) {
  const [activeStep, setActiveStep] = useState(0);
  const [phase, setPhase] = useState<AnalysisPhase>(isFrontendBypassEnabled && previewState !== "processing" ? "complete" : "running");
  const [failThisRun, setFailThisRun] = useState(simulateFailure);
  const [hasReadySources, setHasReadySources] = useState(true);

  useEffect(() => {
    const ready = isFrontendBypassEnabled || readMockSources(courseId).some((source) => source.status === "Ready");
    window.setTimeout(() => setHasReadySources(ready), 0);
  }, [courseId]);

  useEffect(() => {
    if (phase !== "running" || !hasReadySources) return;
    const timer = window.setTimeout(() => {
      if (failThisRun && activeStep === 3) {
        setPhase("failed");
        return;
      }
      if (activeStep >= processingSteps.length - 1) {
        setPhase("complete");
        return;
      }
      setActiveStep((current) => current + 1);
    }, activeStep === processingSteps.length - 1 ? 550 : 720);
    return () => window.clearTimeout(timer);
  }, [activeStep, failThisRun, hasReadySources, phase]);

  useEffect(() => {
    if (phase === "complete") markAnalysisComplete(courseId);
  }, [courseId, phase]);

  if (!hasReadySources) return <MissingSources courseId={courseId} />;
  if (phase === "failed") return <AnalysisFailure courseId={courseId} onRetry={() => { setFailThisRun(false); setPhase("running"); }} />;
  if (phase === "running") return <ProcessingExperience activeStep={activeStep} />;
  return <AnalysisResult courseId={courseId} />;
}

function MissingSources({ courseId }: { courseId: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><AlertTriangle className="size-6" aria-hidden="true" /></span><h1 className="type-h1 mt-5">A ready source is required</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">AI analysis has not started because this course has no usable knowledge source. Add a source and wait until its status is Ready.</p><ButtonLink href={`/creator/courses/${courseId}/sources`} className="mt-7">Review knowledge sources<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}

function AnalysisFailure({ courseId, onRetry }: { courseId: string; onRetry: () => void }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full overflow-hidden border-red-100 shadow-sm"><div className="p-7 text-center sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-status-error"><AlertTriangle className="size-6" aria-hidden="true" /></span><Badge variant="error" className="mt-5">Analysis paused</Badge><h1 className="type-h1 mt-4">We couldn’t finish mapping topic relationships</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">Your sources and completed analysis steps are safe. Retry the analysis, or review the source files before trying again.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/sources`} variant="secondary">Review sources</ButtonLink><Button onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry analysis</Button></div></div><p className="type-caption border-t border-border-default bg-neutral-25 px-5 py-3 text-center text-text-tertiary">This is a simulated frontend recovery state. No AI service was called.</p></Card></ContentContainer>;
}

function ProcessingExperience({ activeStep }: { activeStep: number }) {
  const progress = Math.round(((activeStep + 0.55) / processingSteps.length) * 100);
  return (
    <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-[78rem] items-center py-10">
      <div className="w-full">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-blue-800 text-yellow-300 shadow-md"><Sparkles className="size-7" aria-hidden="true" /></span>
          <Badge variant="accent" className="mt-6">AI knowledge processing</Badge>
          <h1 className="type-h1 mt-4">AI is analyzing your knowledge</h1>
          <p className="type-body-large mx-auto mt-3 max-w-2xl text-text-secondary">SkillSync is identifying topics, concepts, relationships, and learning order from your trusted sources.</p>
        </div>

        <Card className="mx-auto mt-9 max-w-3xl overflow-hidden border-blue-200 shadow-md">
          <div className="bg-blue-800 px-5 py-4 text-white sm:px-7"><div className="flex items-center justify-between gap-4"><span className="text-sm font-semibold">Building learning intelligence</span><span className="text-sm text-blue-100">{progress}%</span></div><Progress value={progress} size="sm" className="mt-3 [&_[role=progressbar]]:bg-white/15 [&_[role=progressbar]>div]:bg-yellow-300" /></div>
          <ol className="divide-y divide-border-default p-2 sm:p-4">
            {processingSteps.map((step, index) => {
              const isComplete = index < activeStep;
              const isCurrent = index === activeStep;
              return <li key={step} className={cn("flex items-center gap-4 rounded-md px-3 py-3.5 transition", isCurrent && "bg-blue-50")}><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border", isComplete && "border-status-success bg-status-success text-white", isCurrent && "border-action-primary bg-surface-default text-action-primary ring-4 ring-blue-100", !isComplete && !isCurrent && "border-border-default text-text-tertiary")}>{isComplete ? <Check className="size-4" aria-hidden="true" /> : isCurrent ? <Sparkles className="size-4 animate-pulse" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}</span><span className={cn("font-medium", !isComplete && !isCurrent ? "text-text-tertiary" : "text-text-primary")}>{step}</span>{isCurrent && <span className="type-caption ml-auto hidden text-action-primary sm:block">In progress</span>}</li>;
            })}
          </ol>
        </Card>
        <p className="type-caption mt-5 text-center text-text-tertiary">Mock analysis runs locally for this prototype. Your course setup is safe to leave open.</p>
      </div>
    </ContentContainer>
  );
}

function AnalysisResult({ courseId }: { courseId: string }) {
  const [topicId, setTopicId] = useState("customer-journey");
  const topic = analysisTopics.find((item) => item.id === topicId) ?? analysisTopics[0];
  const [conceptId, setConceptId] = useState("awareness-stage");
  const concept = topic.concepts.find((item) => item.id === conceptId) ?? topic.concepts[0];
  const [references, setReferences] = useState<SourceReference[] | null>(null);
  const summaryCards: Array<{ value: number; label: string; icon: LucideIcon }> = [
    { value: analysisSummary.sourcesAnalyzed, label: "Sources analyzed", icon: FileCheck2 },
    { value: analysisSummary.topicsIdentified, label: "Topics identified", icon: Layers3 },
    { value: analysisSummary.conceptsExtracted, label: "Concepts extracted", icon: BookOpenCheck },
    { value: analysisSummary.referencesLinked, label: "References linked", icon: Link2 },
  ];

  function selectTopic(id: string) {
    const selected = analysisTopics.find((item) => item.id === id);
    setTopicId(id);
    setConceptId(selected?.concepts[0]?.id ?? "");
  }

  return (
    <ContentContainer className="max-w-[86rem]">
      <PageHeader
        eyebrow="Digital Marketing Foundations"
        title="Knowledge analysis"
        description="SkillSync structured your trusted sources into learning-ready topics, concepts, relationships, and references."
        breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: "Digital Marketing Foundations" }, { label: "Knowledge analysis" }]}
        actions={<Badge variant="success"><FileCheck2 className="size-3.5" aria-hidden="true" />Source grounded</Badge>}
      />

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Analysis summary">
        {summaryCards.map(({ value, label, icon: Icon }) => <Card key={label} className="p-4 sm:p-5"><Icon className="size-5 text-action-primary" aria-hidden="true" /><p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p><p className="type-caption mt-1 text-text-secondary sm:text-sm">{label}</p></Card>)}
      </section>

      <section className="mt-8" aria-labelledby="topics-heading">
        <div className="mb-4"><h2 id="topics-heading" className="type-title-large">Topics and concepts</h2><p className="type-body-small mt-1 text-text-secondary">Select a topic to inspect its learning concepts and source grounding.</p></div>
        <Card className="overflow-hidden shadow-sm lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="border-b border-border-default bg-neutral-25 p-3 lg:border-r lg:border-b-0">
            <p className="type-caption px-3 py-2 font-semibold tracking-wide text-text-tertiary uppercase">Extracted topics</p>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
              {analysisTopics.map((item) => <button key={item.id} type="button" aria-pressed={topic.id === item.id} onClick={() => selectTopic(item.id)} className={cn("min-w-56 rounded-md px-3 py-3 text-left transition lg:min-w-0", topic.id === item.id ? "bg-blue-100 text-blue-900" : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary")}><span className="block text-sm font-semibold">{item.name}</span><span className="type-caption mt-1 block">{item.conceptCount} concepts · {item.sourceCount} sources</span></button>)}
            </div>
          </div>
          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="type-caption font-semibold tracking-wide text-action-primary uppercase">Topic</p><h3 className="type-h3 mt-1">{topic.name}</h3></div><Badge variant="info">{topic.sourceCount} trusted sources</Badge></div>
            <div className="mt-6 flex gap-2 overflow-x-auto border-b border-border-default pb-3">{topic.concepts.map((item) => <button key={item.id} type="button" aria-pressed={concept.id === item.id} onClick={() => setConceptId(item.id)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold", concept.id === item.id ? "bg-blue-800 text-white" : "bg-neutral-100 text-text-secondary hover:bg-neutral-200")}>{item.name}</button>)}</div>
            <ConceptDetail concept={concept} onViewSources={() => setReferences(concept.references)} />
          </div>
        </Card>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RelationshipCard />
        <SequenceCard />
      </div>

      <Card className="mt-8 overflow-hidden border-blue-200 shadow-sm">
        <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-status-success-subtle text-status-success"><CheckCircle2 className="size-6" aria-hidden="true" /></span><div><h2 className="type-title-large">Knowledge analysis complete</h2><p className="mt-2 max-w-2xl text-text-secondary">Your sources have been structured into topics, concepts, relationships, and a recommended learning sequence.</p></div></div>
          <div className="flex flex-col gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/sources`} variant="secondary">Review sources</ButtonLink><ButtonLink href={`/creator/courses/${courseId}/generate`} size="lg">Generate course<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>
        </div>
      </Card>

      {references && <SourceReferencesDrawer references={references} onClose={() => setReferences(null)} description="These prototype references show how the knowledge analysis traces back to trusted sources." />}
    </ContentContainer>
  );
}

function ConceptDetail({ concept, onViewSources }: { concept: Concept; onViewSources: () => void }) {
  return <div className="mt-6 rounded-lg border border-border-default bg-neutral-25 p-5 sm:p-6"><div className="flex items-center gap-2 text-text-tertiary"><BookOpenCheck className="size-4" aria-hidden="true" /><span className="type-caption font-semibold tracking-wide uppercase">Concept summary</span></div><h4 className="type-title-large mt-3">{concept.name}</h4><p className="mt-3 leading-7 text-text-secondary">{concept.summary}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4"><span className="type-body-small flex items-center gap-2 text-text-secondary"><FileCheck2 className="size-4 text-status-success" aria-hidden="true" />Based on {concept.sourceCount} sources</span><Button variant="secondary" size="sm" onClick={onViewSources}><Quote className="size-4" aria-hidden="true" />View sources</Button></div></div>;
}

function RelationshipCard() {
  const nodes = ["Marketing Fundamentals", "Customer Journey", "Channel Strategy", "Campaign Measurement"];
  return <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-700"><Network className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">Topic relationships</h2><p className="type-body-small mt-1 text-text-secondary">SkillSync found a clear learning dependency.</p></div></div><div className="mx-auto mt-6 max-w-md">{nodes.map((node, index) => <div key={node} className="flex flex-col items-center"><div className={cn("w-full rounded-md border px-4 py-3 text-center text-sm font-semibold", index === 0 ? "border-blue-300 bg-blue-50 text-blue-900" : "border-border-default bg-surface-default")}>{node}</div>{index < nodes.length - 1 && <ArrowDown className="my-2 size-4 text-blue-400" aria-label="leads to" />}</div>)}</div></Card>;
}

function SequenceCard() {
  return <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-yellow-100 text-neutral-800"><Layers3 className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">Recommended learning order</h2><p className="type-body-small mt-1 text-text-secondary">From foundations to execution and measurement.</p></div></div><ol className="mt-6 grid gap-2">{learningSequence.map((item, index) => <li key={item} className="flex items-center gap-3 rounded-md bg-neutral-25 p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-800 text-sm font-semibold text-white">{index + 1}</span><span className="font-medium">{item}</span></li>)}</ol><p className="type-body-small mt-5 rounded-md bg-blue-50 p-3 text-blue-800">This order moves learners from foundational concepts to campaign execution and measurement.</p></Card>;
}
