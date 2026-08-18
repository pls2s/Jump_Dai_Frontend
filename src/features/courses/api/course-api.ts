import { apiRequest } from "@/lib/api/api-client";

export type ApiCourseStatus =
  | "DRAFT"
  | "GENERATING"
  | "WAITING_VERIFICATION"
  | "VERIFIED"
  | "PUBLISHED"
  | "FAILED";

export type ApiDifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface ApiCourse {
  id: number;
  title: string;
  description: string;
  target_learner: string;
  difficulty_level: ApiDifficultyLevel;
  certificate_available: boolean;
  learning_objective: string;
  status: ApiCourseStatus;
  creator_id: number;
  created_at: string;
}

export type CreatedApiCourse = ApiCourse;

export interface CreateCourseInput {
  title: string;
  description: string;
  targetLearner: string;
  difficultyLevel: ApiDifficultyLevel;
  learningObjective: string;
}

export function createCourse(input: CreateCourseInput, accessToken: string) {
  return apiRequest<CreatedApiCourse>("/api/courses", {
    method: "POST",
    token: accessToken,
    body: {
      title: input.title,
      description: input.description,
      target_learner: input.targetLearner,
      difficulty_level: input.difficultyLevel,
      learning_objective: input.learningObjective,
    },
  });
}

export function getCourses(accessToken: string) {
  return apiRequest<ApiCourse[]>("/api/courses", {
    method: "GET",
    token: accessToken,
  });
}

export function getCourse(courseId: number, accessToken: string) {
  return apiRequest<ApiCourse>(`/api/courses/${courseId}`, {
    method: "GET",
    token: accessToken,
  });
}
