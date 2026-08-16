import { apiRequest } from "@/lib/api/api-client";

export type ApiCourseStatus =
  | "DRAFT"
  | "GENERATING"
  | "WAITING_VERIFICATION"
  | "VERIFIED"
  | "PUBLISHED";

export interface ApiCourse {
  id: number;
  title: string;
  description: string;
  goal: string;
  status: ApiCourseStatus;
  creator_id: number;
}

export interface CreatedApiCourse extends ApiCourse {
  created_at: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  goal: string;
}

export function createCourse(input: CreateCourseInput, accessToken: string) {
  return apiRequest<CreatedApiCourse>("/api/courses", {
    method: "POST",
    token: accessToken,
    body: input,
  });
}

export function getCourses(accessToken: string) {
  return apiRequest<Array<Pick<ApiCourse, "id" | "title" | "status">>>("/api/courses", {
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

export function deleteCourse(courseId: number, accessToken: string) {
  return apiRequest<void>(`/api/courses/${courseId}`, {
    method: "DELETE",
    token: accessToken,
  });
}
