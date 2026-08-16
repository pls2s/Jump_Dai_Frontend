"use client";

import { useEffect, useRef, useState } from "react";
import { ListTree, X } from "lucide-react";

import { Button } from "@/components/ui";
import type { GeneratedCourse, ReviewStatus } from "@/types/product";
import { CourseStructureNav } from "./course-structure-nav";

function itemLabel(course: GeneratedCourse, selectedId: string) {
  if (selectedId === "course-overview") return "Course overview";
  for (const generatedModule of course.modules) {
    if (generatedModule.id === selectedId) return generatedModule.title;
    const lesson = generatedModule.lessons.find((item) => item.id === selectedId);
    if (lesson) return lesson.title;
  }
  if (course.practicalTask.id === selectedId) return course.practicalTask.title;
  if (course.finalAssessment.id === selectedId) return course.finalAssessment.title;
  return "Course overview";
}

export function CourseStructurePanel({
  course,
  selectedId,
  onSelect,
  reviews,
}: {
  course: GeneratedCourse;
  selectedId: string;
  onSelect: (itemId: string) => void;
  reviews?: Record<string, ReviewStatus>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const selectedLabel = itemLabel(course, selectedId);

  useEffect(() => {
    if (!mobileOpen) return;
    closeRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function selectMobile(itemId: string) {
    onSelect(itemId);
    setMobileOpen(false);
  }

  return (
    <>
      <Button variant="secondary" className="w-full justify-start gap-3 text-left lg:hidden" onClick={() => setMobileOpen(true)} aria-haspopup="dialog" aria-expanded={mobileOpen}>
        <ListTree className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold tracking-wide text-text-tertiary uppercase">Course structure</span><span className="block truncate">{selectedLabel}</span></span>
      </Button>

      <aside className="hidden max-h-[calc(100dvh-7rem)] self-start overflow-hidden rounded-lg border border-border-default bg-surface-default lg:sticky lg:top-24 lg:block" aria-label="Course structure panel">
        <CourseStructureNav course={course} selectedId={selectedId} onSelect={onSelect} reviews={reviews} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/35 backdrop-blur-[2px] lg:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="mobile-course-structure-title" className="flex h-dvh w-[min(22rem,calc(100vw-2.5rem))] flex-col bg-surface-default shadow-lg">
            <div className="flex items-center justify-between gap-4 border-b border-border-default px-4 py-3">
              <div><p id="mobile-course-structure-title" className="font-semibold">Course structure</p><p className="type-caption mt-0.5 text-text-tertiary">Choose content to inspect</p></div>
              <Button ref={closeRef} variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close course structure"><X className="size-5" aria-hidden="true" /></Button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden"><CourseStructureNav course={course} selectedId={selectedId} onSelect={selectMobile} reviews={reviews} showSummary={false} /></div>
          </aside>
        </div>
      )}
    </>
  );
}
