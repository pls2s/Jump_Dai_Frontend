import { apiRequest } from "@/lib/api/api-client";

export type ApiDocumentStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export interface ApiCourseDocument {
  id: number;
  course_id?: number;
  filename: string;
  file_type?: string;
  size?: number;
  status: ApiDocumentStatus;
  source_type?: "FILE" | "URL";
  chunk_count?: number;
  processing_error?: string | null;
  updated_at?: string;
}

export interface ProcessKnowledgeSourceResult {
  source: ApiCourseDocument;
  chunks_created: number;
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

/** Read source status and chunk counts after Knowledge Processing. */
export function getKnowledgeSources(courseId: number, accessToken: string) {
  return apiRequest<ApiCourseDocument[]>(`/api/courses/${courseId}/knowledge-sources`, {
    method: "GET",
    token: accessToken,
  });
}

/** Extract a source and save its locally indexed knowledge chunks. */
export function processKnowledgeSource(sourceId: number, accessToken: string) {
  return apiRequest<ProcessKnowledgeSourceResult>(`/api/knowledge-sources/${sourceId}/process`, {
    method: "POST",
    token: accessToken,
  });
}

export function deleteDocument(documentId: number, accessToken: string) {
  return apiRequest<void>(`/api/documents/${documentId}`, {
    method: "DELETE",
    token: accessToken,
  });
}
