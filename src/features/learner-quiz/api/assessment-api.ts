import { apiRequest } from "@/lib/api/api-client";

export type ApiAssessmentType = "QUIZ" | "POST_ASSESSMENT" | "PRACTICAL";

export interface ApiCourseAssessment {
  id: number;
  course_id: number;
  title: string;
  assessment_type: ApiAssessmentType;
  topics: string[];
  passing_score: number;
  is_final_assessment: boolean;
  created_at: string;
}

export interface ApiAssessmentTopicScore {
  topic: string;
  score: number;
}

export interface ApiAssessmentAttempt {
  id: number;
  assessment_id: number;
  learner_id: number;
  topic_scores: ApiAssessmentTopicScore[];
  score: number;
  passing_score: number;
  passed: boolean;
  skill_score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  evidence_url: string | null;
  evidence_text: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  review_reason: string | null;
}

export interface ApiAssessmentSubmission {
  result: ApiAssessmentAttempt;
  adapted_learning_path: unknown | null;
}

export function listApiCourseAssessments(courseId: number, accessToken: string) {
  return apiRequest<ApiCourseAssessment[]>(`/api/courses/${courseId}/assessments`, {
    method: "GET",
    token: accessToken,
  });
}

export function submitApiAssessment(
  assessmentId: number,
  input: {
    topicScores: ApiAssessmentTopicScore[];
    evidenceUrl?: string;
    evidenceText?: string;
  },
  accessToken: string,
) {
  return apiRequest<ApiAssessmentSubmission>(`/api/assessments/${assessmentId}/submit`, {
    method: "POST",
    token: accessToken,
    body: {
      topic_scores: input.topicScores.map((item) => ({ topic: item.topic, score: item.score })),
      evidence_url: input.evidenceUrl || undefined,
      evidence_text: input.evidenceText || undefined,
    },
  });
}

/** Read the signed-in learner's own saved attempts; Admin/Creator attempts stay private. */
export function getApiMyAssessmentAttempts(assessmentId: number, accessToken: string) {
  return apiRequest<ApiAssessmentAttempt[]>(`/api/assessments/${assessmentId}/my-attempts`, {
    method: "GET",
    token: accessToken,
  });
}
