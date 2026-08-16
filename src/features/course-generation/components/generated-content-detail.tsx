"use client";

import { Check, ClipboardCheck, FileCheck2, FileQuestion, Lightbulb, ListChecks, Quote } from "lucide-react";

import { Badge, Button, Card } from "@/components/ui";
import type { ReviewableItem, SourceReference } from "@/types/product";

export function GeneratedContentDetail({ item, onViewSources }: { item: ReviewableItem; onViewSources: (references: SourceReference[]) => void }) {
  if (item.kind === "course") {
    return (
      <div>
        <Badge variant="accent">Course outline</Badge>
        <h2 className="type-h2 mt-4">{item.value.title}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-text-secondary">{item.value.description}</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2"><Info label="Target learner" value={item.value.targetLearner} /><Info label="Difficulty" value={item.value.level} /></div>
        <section className="mt-7"><h3 className="type-title-large">Learning objectives</h3><ul className="mt-4 grid gap-3">{item.value.learningObjectives.map((objective) => <li key={objective} className="flex gap-3 text-text-secondary"><Check className="mt-1 size-4 shrink-0 text-status-success" aria-hidden="true" />{objective}</li>)}</ul></section>
      </div>
    );
  }

  if (item.kind === "module") {
    return (
      <div><Badge variant="info">Module</Badge><h2 className="type-h2 mt-4">{item.value.title}</h2><p className="mt-3 leading-7 text-text-secondary">{item.value.description}</p><div className="mt-7 rounded-lg bg-neutral-25 p-5"><p className="type-label">{item.value.lessons.length} lessons</p><ol className="mt-3 grid gap-2">{item.value.lessons.map((lesson, index) => <li key={lesson.id} className="flex items-center gap-3 rounded-md bg-surface-default p-3"><span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">{index + 1}</span><span className="font-medium">{lesson.title}</span></li>)}</ol></div></div>
    );
  }

  if (item.kind === "lesson") {
    const lesson = item.value;
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2"><Badge variant="info">Lesson</Badge><Badge variant="success"><FileCheck2 className="size-3.5" aria-hidden="true" />Source grounded</Badge></div>
        <h2 className="type-h2 mt-4">{lesson.title}</h2>
        <div className="mt-5 rounded-md bg-blue-50 p-4"><p className="type-caption font-semibold tracking-wide text-blue-800 uppercase">Learning objective</p><p className="mt-2 text-blue-950">{lesson.learningObjective}</p></div>
        <section className="mt-7"><h3 className="type-title-large">Lesson summary</h3><p className="mt-3 leading-7 text-text-secondary">{lesson.summary}</p></section>
        {lesson.exercise && <Card className="mt-7 p-5"><div className="flex items-center gap-2"><Lightbulb className="size-5 text-action-primary" aria-hidden="true" /><h3 className="type-title-large">Exercise</h3></div><p className="mt-3 text-text-secondary">{lesson.exercise.prompt}</p></Card>}
        {lesson.quiz && <Card className="mt-5 p-5"><div className="flex items-center gap-2"><ListChecks className="size-5 text-action-primary" aria-hidden="true" /><h3 className="type-title-large">Creator quiz preview</h3></div><p className="mt-4 font-semibold">{lesson.quiz.question}</p><ul className="mt-3 grid gap-2">{lesson.quiz.options.map((option) => <li key={option.id} className={`flex items-start gap-3 rounded-md border p-3 ${option.isCorrect ? "border-green-200 bg-status-success-subtle" : "border-border-default"}`}><span className="font-semibold uppercase">{option.id}.</span><span className="flex-1">{option.text}</span>{option.isCorrect && <Badge variant="success">Correct answer</Badge>}</li>)}</ul><p className="type-body-small mt-4 text-text-secondary"><strong>Explanation:</strong> {lesson.quiz.explanation}</p></Card>}
        <GroundingFooter references={lesson.references} onViewSources={onViewSources} />
      </div>
    );
  }

  if (item.kind === "practical-task") {
    const task = item.value;
    return (
      <div><Badge variant="accent"><ClipboardCheck className="size-3.5" aria-hidden="true" />Practical task</Badge><h2 className="type-h2 mt-4">{task.title}</h2><p className="mt-3 leading-7 text-text-secondary">{task.instructions}</p><section className="mt-7"><h3 className="type-title-large">Expected deliverables</h3><ul className="mt-3 grid gap-2">{task.deliverables.map((deliverable) => <li key={deliverable} className="flex gap-3 text-text-secondary"><Check className="mt-1 size-4 shrink-0 text-status-success" aria-hidden="true" />{deliverable}</li>)}</ul></section><section className="mt-7"><h3 className="type-title-large">Rubric preview</h3><div className="mt-3 grid gap-3">{task.rubric.map((criterion) => <Card key={criterion.id} className="p-4"><div className="flex items-center justify-between gap-4"><h4 className="font-semibold">{criterion.criterion}</h4><Badge variant="neutral">{criterion.weight}%</Badge></div><p className="type-body-small mt-2 text-text-secondary">{criterion.description}</p></Card>)}</div></section><GroundingFooter references={task.references} onViewSources={onViewSources} /></div>
    );
  }

  const assessment = item.value;
  return (
    <div><Badge variant="accent"><FileQuestion className="size-3.5" aria-hidden="true" />Final assessment</Badge><h2 className="type-h2 mt-4">{assessment.title}</h2><p className="mt-3 leading-7 text-text-secondary">{assessment.instructions}</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><Info label="Passing score" value={`${assessment.passingScore}%`} /><div className="rounded-lg border border-border-default p-4"><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">Assessment coverage</p><div className="mt-3 flex flex-wrap gap-2">{assessment.objectiveCoverage.map((objective) => <Badge key={objective} variant="success"><Check className="size-3" aria-hidden="true" />{objective}</Badge>)}</div></div></div><GroundingFooter references={assessment.references} onViewSources={onViewSources} /></div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border-default p-4"><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">{label}</p><p className="mt-2 text-text-secondary">{value}</p></div>;
}

function GroundingFooter({ references, onViewSources }: { references: SourceReference[]; onViewSources: (references: SourceReference[]) => void }) {
  return <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-5"><span className="type-body-small flex items-center gap-2 text-text-secondary"><FileCheck2 className="size-4 text-status-success" aria-hidden="true" />Based on {references.length} source references</span><Button variant="secondary" size="sm" onClick={() => onViewSources(references)}><Quote className="size-4" aria-hidden="true" />View sources</Button></div>;
}
