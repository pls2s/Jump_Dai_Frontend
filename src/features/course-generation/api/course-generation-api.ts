import { apiRequest } from "@/lib/api/api-client";

export interface ApiGeneratedLesson {
  title: string;
  summary: string;
  source_references: string[];
}

export interface ApiGeneratedModule {
  title: string;
  description: string;
  learning_objectives: string[];
  lessons: ApiGeneratedLesson[];
}

export interface ApiGeneratedLearningPath {
  course_id: number;
  title: string;
  overview: string;
  modules: ApiGeneratedModule[];
}

export interface ApiCourseGenerationResult {
  course_id: number;
  status: "WAITING_VERIFICATION";
  progress: number;
  generated_at: string;
  learning_path: ApiGeneratedLearningPath;
}

export interface ApiCourseGenerationStatus {
  course_id: number;
  status: "DRAFT" | "GENERATING" | "WAITING_VERIFICATION" | "VERIFIED" | "PUBLISHED" | "FAILED";
  progress: number;
  error: string | null;
  generated_at: string | null;
  verified_at: string | null;
  has_learning_path: boolean;
}

export interface ApiLearningPathUpdateInput {
  overview: string;
  modules: ApiGeneratedModule[];
}

export interface ApiCourseVerificationResult {
  course_id: number;
  status: "VERIFIED";
  verified_at: string;
}

/** Ask the configured Typhoon provider to create a source-grounded course draft. */
export function generateCourseWithTyphoon(courseId: number, accessToken: string) {
  return apiRequest<ApiCourseGenerationResult>(`/api/courses/${courseId}/generate`, {
    method: "POST",
    token: accessToken,
  });
}

/** Read the persisted generation state for a Creator-owned course. */
export function getCourseGenerationStatus(courseId: number, accessToken: string) {
  return apiRequest<ApiCourseGenerationStatus>(`/api/courses/${courseId}/generation-status`, {
    method: "GET",
    token: accessToken,
  });
}

/** Read the latest source-grounded draft after Typhoon has completed. */
export function getGeneratedLearningPath(courseId: number, accessToken: string) {
  return apiRequest<ApiGeneratedLearningPath>(`/api/courses/${courseId}/learning-path`, {
    method: "GET",
    token: accessToken,
  });
}

/** Save Creator edits while preserving the cited source chunk IDs. */
export function updateGeneratedLearningPath(
  courseId: number,
  input: ApiLearningPathUpdateInput,
  accessToken: string,
) {
  return apiRequest<ApiGeneratedLearningPath>(`/api/courses/${courseId}/learning-path`, {
    method: "PUT",
    token: accessToken,
    body: input,
  });
}

/** Mark the reviewed Backend learning path as verified and ready to publish. */
export function verifyGeneratedLearningPath(courseId: number, accessToken: string) {
  return apiRequest<ApiCourseVerificationResult>(`/api/courses/${courseId}/verify`, {
    method: "POST",
    token: accessToken,
  });
}
