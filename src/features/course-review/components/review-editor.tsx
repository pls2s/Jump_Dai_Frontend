"use client";

import { Check, Circle } from "lucide-react";

import { Field, FieldDescription, FieldError, FieldLabel, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { GeneratedCourse, ReviewableItem } from "@/types/product";

export interface ReviewDraft {
  title: string;
  description: string;
  learningObjective: string;
  summary: string;
  exercisePrompt: string;
  quizQuestion: string;
  quizOptions: Array<{ id: string; text: string }>;
  correctOptionId: string;
  quizExplanation: string;
  instructions: string;
  passingScore: string;
}

export function createReviewDraft(item: ReviewableItem): ReviewDraft {
  const empty: ReviewDraft = { title: "", description: "", learningObjective: "", summary: "", exercisePrompt: "", quizQuestion: "", quizOptions: [], correctOptionId: "", quizExplanation: "", instructions: "", passingScore: "" };
  if (item.kind === "course") return { ...empty, title: item.value.title, description: item.value.description };
  if (item.kind === "module") return { ...empty, title: item.value.title, description: item.value.description };
  if (item.kind === "lesson") return { ...empty, title: item.value.title, learningObjective: item.value.learningObjective, summary: item.value.summary, exercisePrompt: item.value.exercise?.prompt ?? "", quizQuestion: item.value.quiz?.question ?? "", quizOptions: item.value.quiz?.options.map((option) => ({ id: option.id, text: option.text })) ?? [], correctOptionId: item.value.quiz?.options.find((option) => option.isCorrect)?.id ?? "", quizExplanation: item.value.quiz?.explanation ?? "" };
  if (item.kind === "practical-task") return { ...empty, title: item.value.title, instructions: item.value.instructions };
  return { ...empty, title: item.value.title, instructions: item.value.instructions, passingScore: String(item.value.passingScore) };
}

export function validateReviewDraft(item: ReviewableItem, draft: ReviewDraft) {
  if (draft.title.trim().length < 3) return "Use a title with at least 3 characters.";
  if ((item.kind === "course" || item.kind === "module") && draft.description.trim().length < 20) return "Add a description with at least 20 characters.";
  if (item.kind === "lesson") {
    if (draft.learningObjective.trim().length < 8) return "Complete the lesson learning objective.";
    if (draft.summary.trim().length < 20) return "Add a lesson summary with at least 20 characters.";
    if (item.value.exercise && draft.exercisePrompt.trim().length < 10) return "Complete the generated exercise prompt.";
    if (item.value.quiz) {
      if (draft.quizQuestion.trim().length < 8 || draft.quizOptions.some((option) => option.text.trim().length < 1)) return "Complete the quiz question and every answer option.";
      if (!draft.correctOptionId) return "Choose the correct quiz answer.";
      if (draft.quizExplanation.trim().length < 8) return "Add a short correct-answer explanation.";
    }
  }
  if ((item.kind === "practical-task" || item.kind === "final-assessment") && draft.instructions.trim().length < 20) return "Add instructions with at least 20 characters.";
  if (item.kind === "final-assessment") {
    const score = Number(draft.passingScore);
    if (!Number.isFinite(score) || score < 1 || score > 100) return "Use a passing score from 1 to 100.";
  }
  return "";
}

export function applyReviewDraft(course: GeneratedCourse, item: ReviewableItem, draft: ReviewDraft): GeneratedCourse {
  if (item.kind === "course") return { ...course, title: draft.title.trim(), description: draft.description.trim() };
  if (item.kind === "module") return { ...course, modules: course.modules.map((module) => module.id === item.id ? { ...module, title: draft.title.trim(), description: draft.description.trim() } : module) };
  if (item.kind === "lesson") {
    return {
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => lesson.id !== item.id ? lesson : {
          ...lesson,
          title: draft.title.trim(),
          learningObjective: draft.learningObjective.trim(),
          summary: draft.summary.trim(),
          exercise: lesson.exercise ? { ...lesson.exercise, prompt: draft.exercisePrompt.trim() } : undefined,
          quiz: lesson.quiz ? {
            ...lesson.quiz,
            question: draft.quizQuestion.trim(),
            options: lesson.quiz.options.map((option) => ({ ...option, text: draft.quizOptions.find((draftOption) => draftOption.id === option.id)?.text.trim() ?? option.text, isCorrect: option.id === draft.correctOptionId })),
            explanation: draft.quizExplanation.trim(),
          } : undefined,
        }),
      })),
    };
  }
  if (item.kind === "practical-task") return { ...course, practicalTask: { ...course.practicalTask, title: draft.title.trim(), instructions: draft.instructions.trim() } };
  return { ...course, finalAssessment: { ...course.finalAssessment, title: draft.title.trim(), instructions: draft.instructions.trim(), passingScore: Number(draft.passingScore) } };
}

export function ReviewEditor({ item, draft, error, onChange }: { item: ReviewableItem; draft: ReviewDraft; error: string; onChange: (draft: ReviewDraft) => void }) {
  function update(updates: Partial<ReviewDraft>) { onChange({ ...draft, ...updates }); }
  return (
    <div className="grid gap-6">
      {error && <FieldError id="review-editor-error">{error}</FieldError>}
      <Field><FieldLabel htmlFor="review-title">{item.kind === "course" ? "Course title" : item.kind === "module" ? "Module title" : item.kind === "lesson" ? "Lesson title" : "Title"}</FieldLabel><Input id="review-title" value={draft.title} onChange={(event) => update({ title: event.target.value })} aria-describedby={error ? "review-editor-error" : undefined} /></Field>
      {(item.kind === "course" || item.kind === "module") && <Field><FieldLabel htmlFor="review-description">Description</FieldLabel><Textarea id="review-description" rows={5} value={draft.description} onChange={(event) => update({ description: event.target.value })} /><FieldDescription>Keep the description clear and useful to learners.</FieldDescription></Field>}
      {item.kind === "lesson" && <LessonFields item={item} draft={draft} onChange={update} />}
      {(item.kind === "practical-task" || item.kind === "final-assessment") && <Field><FieldLabel htmlFor="review-instructions">Instructions</FieldLabel><Textarea id="review-instructions" rows={7} value={draft.instructions} onChange={(event) => update({ instructions: event.target.value })} /></Field>}
      {item.kind === "final-assessment" && <Field className="max-w-xs"><FieldLabel htmlFor="review-passing-score">Passing score</FieldLabel><Input id="review-passing-score" type="number" min={1} max={100} value={draft.passingScore} onChange={(event) => update({ passingScore: event.target.value })} /><FieldDescription>Percentage from 1 to 100.</FieldDescription></Field>}
    </div>
  );
}

function LessonFields({ item, draft, onChange }: { item: Extract<ReviewableItem, { kind: "lesson" }>; draft: ReviewDraft; onChange: (updates: Partial<ReviewDraft>) => void }) {
  function updateOption(optionId: string, text: string) { onChange({ quizOptions: draft.quizOptions.map((option) => option.id === optionId ? { ...option, text } : option) }); }
  return <>
    <Field><FieldLabel htmlFor="review-objective">Lesson learning objective</FieldLabel><Textarea id="review-objective" rows={3} value={draft.learningObjective} onChange={(event) => onChange({ learningObjective: event.target.value })} /></Field>
    <Field><FieldLabel htmlFor="review-summary">Lesson content summary</FieldLabel><Textarea id="review-summary" rows={7} value={draft.summary} onChange={(event) => onChange({ summary: event.target.value })} /></Field>
    {item.value.exercise && <Field><FieldLabel htmlFor="review-exercise">Exercise</FieldLabel><Textarea id="review-exercise" rows={4} value={draft.exercisePrompt} onChange={(event) => onChange({ exercisePrompt: event.target.value })} /></Field>}
    {item.value.quiz && <fieldset className="rounded-lg border border-border-default p-5"><legend className="type-label px-1">Creator quiz</legend><div className="mt-3 grid gap-5"><Field><FieldLabel htmlFor="review-quiz-question">Question</FieldLabel><Textarea id="review-quiz-question" rows={3} value={draft.quizQuestion} onChange={(event) => onChange({ quizQuestion: event.target.value })} /></Field><div><p className="type-label">Answer options</p><div className="mt-3 grid gap-3" role="radiogroup" aria-label="Correct quiz answer">{draft.quizOptions.map((option) => { const correct = draft.correctOptionId === option.id; return <div key={option.id} className={cn("grid gap-2 rounded-md border p-3 sm:grid-cols-[auto_minmax(0,1fr)]", correct ? "border-green-300 bg-status-success-subtle" : "border-border-default")}><button type="button" role="radio" aria-checked={correct} onClick={() => onChange({ correctOptionId: option.id })} className="flex min-h-11 items-center gap-2 rounded-sm px-2 text-left font-medium"><span className={cn("flex size-6 items-center justify-center rounded-full border", correct ? "border-status-success bg-status-success text-white" : "border-border-strong")}>{correct ? <Check className="size-3.5" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}</span><span className="uppercase">{option.id}</span></button><Input aria-label={`Answer option ${option.id.toUpperCase()}`} value={option.text} onChange={(event) => updateOption(option.id, event.target.value)} /></div>; })}</div></div><Field><FieldLabel htmlFor="review-quiz-explanation">Correct-answer explanation</FieldLabel><Textarea id="review-quiz-explanation" rows={3} value={draft.quizExplanation} onChange={(event) => onChange({ quizExplanation: event.target.value })} /></Field></div></fieldset>}
  </>;
}
