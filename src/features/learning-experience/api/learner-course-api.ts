import { apiRequest } from "@/lib/api/api-client";

export interface ApiEnrollment {
  course_id: number;
  course_title: string;
  enrolled_at: string;
}

export interface ApiLearnerLesson {
  id: string;
  course_id: number;
  module_title: string;
  title: string;
  summary: string;
  source_references: string[];
  completed: boolean;
}

export interface ApiLearnerCoursePath {
  course_id: number;
  course_title: string;
  overview: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_lesson_count: number;
  total_lesson_count: number;
  lessons: ApiLearnerLesson[];
}

export interface ApiLearningProgress {
  course_id: number;
  progress_percentage: number;
  completed_lesson_count: number;
  total_lesson_count: number;
  completed: boolean;
  last_activity_at: string;
}

export interface ApiLessonCompletion {
  lesson: {
    id: string;
    course_id: number;
    completed: true;
  };
  progress: ApiLearningProgress;
}

/** Enroll the current learner in a verified, published course. This is idempotent. */
export function enrollInApiCourse(courseId: number, accessToken: string) {
  return apiRequest<ApiEnrollment>(`/api/courses/${courseId}/enroll`, {
    method: "POST",
    token: accessToken,
  });
}

/** Get the generated lessons and saved completion state for an enrolled course. */
export function getApiLearnerCoursePath(courseId: number, accessToken: string) {
  return apiRequest<ApiLearnerCoursePath>(`/api/learning/courses/${courseId}/path`, {
    method: "GET",
    token: accessToken,
  });
}

/** Load one enrolled course lesson directly from the learner API. */
export function getApiLearnerLesson(lessonId: string, accessToken: string) {
  return apiRequest<ApiLearnerLesson>(`/api/lessons/${lessonId}`, {
    method: "GET",
    token: accessToken,
  });
}

/** Persist completion for one lesson and receive the new progress summary. */
export function completeApiLearnerLesson(lessonId: string, accessToken: string) {
  return apiRequest<ApiLessonCompletion>(`/api/lessons/${lessonId}/complete`, {
    method: "POST",
    token: accessToken,
  });
}

/** Read a compact course progress value without loading all lesson content. */
export function getApiLearnerProgress(courseId: number, accessToken: string) {
  return apiRequest<ApiLearningProgress>(`/api/learning/courses/${courseId}/progress`, {
    method: "GET",
    token: accessToken,
  });
}
