"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, FileQuestion, Layers3 } from "lucide-react";

import { cn } from "@/lib/cn";
import type { GeneratedCourse, ReviewStatus } from "@/types/product";

function selectedModuleId(course: GeneratedCourse, selectedId: string) {
  return course.modules.find(
    (module) => module.id === selectedId || module.lessons.some((lesson) => lesson.id === selectedId),
  )?.id;
}

export function CourseStructureNav({
  course,
  selectedId,
  onSelect,
  reviews,
  showSummary = true,
}: {
  course: GeneratedCourse;
  selectedId: string;
  onSelect: (itemId: string) => void;
  reviews?: Record<string, ReviewStatus>;
  showSummary?: boolean;
}) {
  const [expandedModules, setExpandedModules] = useState(() => {
    const activeModule = selectedModuleId(course, selectedId) ?? course.modules[0]?.id;
    return new Set(activeModule ? [activeModule] : []);
  });

  function toggleModule(moduleId: string) {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function selectItem(itemId: string) {
    const activeModule = selectedModuleId(course, itemId);
    if (activeModule) {
      setExpandedModules((current) => current.has(activeModule) ? current : new Set([...current, activeModule]));
    }
    onSelect(itemId);
  }

  return (
    <nav aria-label="Generated course structure" className="flex max-h-[calc(100dvh-7rem)] min-h-0 min-w-0 flex-col">
      {showSummary && <div className="border-b border-border-default px-4 py-3"><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">Course structure</p><p className="type-caption mt-0.5 text-text-secondary">{course.modules.length} modules · {course.modules.reduce((count, generatedModule) => count + generatedModule.lessons.length, 0)} lessons</p></div>}

      <div className="min-h-0 overflow-y-auto overscroll-contain p-2">
        <StructureButton icon={Layers3} label="Course overview" selected={selectedId === "course-overview"} status={reviews?.["course-overview"]} onClick={() => onSelect("course-overview")} />

        <ol className="mt-2 border-y border-border-default">
          {course.modules.map((module, moduleIndex) => {
            const expanded = expandedModules.has(module.id);
            const moduleSelected = selectedId === module.id;
            return (
              <li key={module.id} className="border-b border-border-default last:border-b-0">
                <div className={cn("flex items-start gap-1 py-1.5 pr-1", moduleSelected && "bg-blue-50")}>
                  <button
                    type="button"
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm text-text-tertiary transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30"
                    onClick={() => toggleModule(module.id)}
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${module.title}`}
                    aria-expanded={expanded}
                    aria-controls={`module-lessons-${module.id}`}
                  >
                    <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      selectItem(module.id);
                    }}
                    aria-pressed={moduleSelected}
                    title={module.title}
                    className={cn(
                      "min-w-0 flex-1 rounded-sm border-l-2 px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30",
                      moduleSelected ? "border-action-primary text-blue-900" : "border-transparent hover:bg-neutral-50",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="type-caption text-text-tertiary">Module {moduleIndex + 1}</span>
                      <span className="type-caption shrink-0 text-text-tertiary">{module.lessons.length} lessons</span>
                    </span>
                    <span className="type-body-small mt-0.5 line-clamp-2 block font-semibold leading-5">{module.title}</span>
                  </button>
                  <ReviewMark status={reviews?.[module.id]} />
                </div>

                {expanded && (
                  <ol id={`module-lessons-${module.id}`} className="ml-4 border-l border-border-default py-1 pl-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const selected = selectedId === lesson.id;
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => selectItem(lesson.id)}
                            aria-pressed={selected}
                            title={lesson.title}
                            className={cn(
                              "flex min-h-10 w-full items-start gap-2.5 rounded-sm border-l-2 px-2.5 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30",
                              selected ? "border-action-primary bg-blue-50 text-blue-900" : "border-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary",
                            )}
                          >
                            <BookOpen className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                            <span className="min-w-0 flex-1">
                              <span className="type-caption block text-text-tertiary">Lesson {moduleIndex + 1}.{lessonIndex + 1}</span>
                              <span className={cn("line-clamp-2 text-sm leading-5", selected ? "font-semibold" : "font-medium")}>{lesson.title}</span>
                            </span>
                            <ReviewMark status={reviews?.[lesson.id]} />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-2 grid gap-0.5">
          <StructureButton icon={ClipboardCheck} label={course.practicalTask.title} eyebrow="Practical task" selected={selectedId === course.practicalTask.id} status={reviews?.[course.practicalTask.id]} onClick={() => onSelect(course.practicalTask.id)} />
          <StructureButton icon={FileQuestion} label={course.finalAssessment.title} eyebrow="Final assessment" selected={selectedId === course.finalAssessment.id} status={reviews?.[course.finalAssessment.id]} onClick={() => onSelect(course.finalAssessment.id)} />
        </div>
      </div>
    </nav>
  );
}

function ReviewMark({ status }: { status?: ReviewStatus }) {
  if (!status) return null;
  const label = status === "verified" ? "Verified" : status === "needs-changes" ? "Needs changes" : status === "in-review" ? "In review" : "Not reviewed";
  return status === "verified"
    ? <CheckCircle2 className="mt-2 size-4 shrink-0 text-status-success" aria-label={label} />
    : <span className={cn("mt-2 size-2 shrink-0 rounded-full", status === "needs-changes" ? "bg-status-error" : status === "in-review" ? "bg-action-primary" : "border border-border-strong")} aria-label={label} role="img" />;
}

function StructureButton({ icon: Icon, label, eyebrow, selected, status, onClick }: { icon: typeof Layers3; label: string; eyebrow?: string; selected: boolean; status?: ReviewStatus; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} title={label} className={cn("flex min-h-11 w-full items-start gap-2.5 rounded-sm border-l-2 px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30", selected ? "border-action-primary bg-blue-50 text-blue-900" : "border-transparent hover:bg-neutral-100")}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{eyebrow && <span className="type-caption block text-text-tertiary">{eyebrow}</span>}<span className="type-body-small line-clamp-2 block font-semibold leading-5">{label}</span></span>
      <ReviewMark status={status} />
    </button>
  );
}
