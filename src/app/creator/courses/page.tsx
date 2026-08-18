"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpen, CirclePlus, RefreshCw } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, FieldError, Spinner } from "@/components/ui";
import { loadCourseList, type CourseListItem } from "@/features/courses/services/course-service";
import type { CourseLifecycleStatus } from "@/types/product";

const statusVariant: Record<CourseLifecycleStatus, "neutral" | "info" | "warning" | "success"> = {
  draft: "neutral",
  review: "warning",
  published: "success",
  unpublished: "info",
};

const statusLabel: Record<CourseLifecycleStatus, string> = { draft: "Draft", review: "Review", published: "Published", unpublished: "Unpublished" };

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCourses(await loadCourseList());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t load your courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCourses(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCourses]);

  return (
    <ContentContainer>
      <PageHeader
        title="My courses"
        description="Manage courses available in your current workspace."
        actions={<div className="flex gap-2"><Button variant="ghost" onClick={loadCourses} disabled={loading}><RefreshCw className="size-4" aria-hidden="true" />Refresh</Button><ButtonLink href="/creator/courses/new/basics"><CirclePlus className="size-4" aria-hidden="true" />Create course</ButtonLink></div>}
      />

      {loading ? (
        <div role="status" className="mt-8 flex items-center gap-3 text-text-secondary"><Spinner />Loading courses…</div>
      ) : error ? (
        <Card className="mt-8 p-6"><FieldError>{error}</FieldError><Button variant="secondary" className="mt-4" onClick={loadCourses}>Try again</Button></Card>
      ) : courses.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center p-10 text-center"><BookOpen className="size-8 text-action-primary" aria-hidden="true" /><h2 className="type-title-large mt-4">No courses yet</h2><p className="type-body-small mt-2 text-text-secondary">Create your first course to add it to this workspace.</p><ButtonLink href="/creator/courses/new/basics" className="mt-5">Create course</ButtonLink></Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-700"><BookOpen className="size-5" aria-hidden="true" /></span><Badge variant={statusVariant[course.status]}>{statusLabel[course.status]}</Badge></div>
              <h2 className="type-title-large mt-5">{course.title}</h2>
              <p className="type-body-small mt-1 text-text-secondary">Course {course.id}</p>
              <div className="mt-5 flex flex-wrap gap-2"><ButtonLink href={course.destination} variant="secondary">{course.actionLabel}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>{course.analyticsHref && <ButtonLink href={course.analyticsHref}>View analytics</ButtonLink>}</div>
            </Card>
          ))}
        </div>
      )}
    </ContentContainer>
  );
}
