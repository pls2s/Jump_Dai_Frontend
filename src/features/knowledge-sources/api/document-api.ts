import { apiRequest } from "@/lib/api/api-client";

export type ApiDocumentStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export interface ApiCourseDocument {
  id: number;
  course_id?: number;
  filename: string;
  file_type?: string;
  size?: number;
  status: ApiDocumentStatus;
}

export function uploadDocument(courseId: number, file: File, accessToken: string) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<ApiCourseDocument>(`/api/courses/${courseId}/documents`, {
    method: "POST",
    token: accessToken,
    formData,
  });
}

export function getDocuments(courseId: number, accessToken: string) {
  return apiRequest<ApiCourseDocument[]>(`/api/courses/${courseId}/documents`, {
    method: "GET",
    token: accessToken,
  });
}

export function deleteDocument(documentId: number, accessToken: string) {
  return apiRequest<void>(`/api/documents/${documentId}`, {
    method: "DELETE",
    token: accessToken,
  });
}
