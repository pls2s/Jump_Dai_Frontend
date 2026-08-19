import type { ApiGeneratedLearningPath } from "@/features/course-generation/api/course-generation-api";
import { apiRequest } from "@/lib/api/api-client";

export interface ApiPublicationResult {
  course_id: number;
  status: "PUBLISHED";
  published_at: string;
}

export interface ApiPublishedCourse {
  id: number;
  title: string;
  description: string;
  target_learner: string;
  difficulty_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  learning_objective: string;
  status: "PUBLISHED";
  module_count: number;
  lesson_count: number;
  published_at: string;
}

export interface ApiPublishedCourseDetail extends ApiPublishedCourse {
  learning_path: ApiGeneratedLearningPath;
}

/** Make a verified Creator course visible through the public Backend catalog. */
export function publishCourse(courseId: number, accessToken: string) {
  return apiRequest<ApiPublicationResult>(`/api/courses/${courseId}/publish`, {
    method: "POST",
    token: accessToken,
  });
}

/** Read a public course detail from the catalog; no Creator token is required. */
export function getPublishedCourse(courseId: number) {
  return apiRequest<ApiPublishedCourseDetail>(`/api/catalog/courses/${courseId}`, {
    method: "GET",
  });
}
