import { apiRequest } from "@/lib/api/api-client";

export type ApiLearningStyle =
  | "VISUAL"
  | "AUDITORY"
  | "READING_WRITING"
  | "KINESTHETIC"
  | "MIXED";

export type ApiLearnerLevel = "FOUNDATION" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ApiGapSeverity = "MODERATE" | "HIGH" | "CRITICAL";

export interface ApiLearningProfile {
  learner_id: number;
  learning_goal: string;
  target_role: string | null;
  learning_styles: ApiLearningStyle[];
  weekly_learning_hours: number;
  updated_at: string;
}

export interface ApiTopicScore {
  topic: string;
  score: number;
}

export interface ApiPreAssessment {
  id: number;
  assessment_title: string;
  topic_scores: ApiTopicScore[];
  passing_score: number;
  overall_score: number;
  learner_level: ApiLearnerLevel;
  submitted_at: string;
}

export interface ApiKnowledgeGap {
  topic: string;
  score: number;
  target_score: number;
  gap_score: number;
  severity: ApiGapSeverity;
}

export interface ApiSkillGap extends ApiKnowledgeGap {
  skill: string;
}

export interface ApiSkillGapAnalysis {
  assessment: ApiPreAssessment;
  knowledge_gaps: ApiKnowledgeGap[];
  skill_gaps: ApiSkillGap[];
  weak_topics: ApiKnowledgeGap[];
}

export interface ApiRecommendedLesson {
  id: string;
  title: string;
  topic: string;
  level: ApiLearnerLevel;
  estimated_minutes: number;
  reason: string;
  study_recommendations: string[];
}

export interface ApiAdditionalContentRecommendation {
  id: string;
  topic: string;
  content_type: "LESSON" | "EXERCISE" | "REFERENCE";
  title: string;
  reason: string;
}

export interface ApiPersonalizedLearningPath {
  id: number;
  learner_id: number;
  learning_goal: string;
  target_role: string | null;
  learning_styles: ApiLearningStyle[];
  weekly_learning_hours: number;
  assessment_id: number;
  assessment_title: string;
  overall_score: number;
  learner_level: ApiLearnerLevel;
  version: number;
  is_adaptive: boolean;
  lessons: ApiRecommendedLesson[];
  weak_topics: ApiKnowledgeGap[];
  additional_content_recommendations: ApiAdditionalContentRecommendation[];
  generated_at: string;
  updated_at: string;
}

export interface LearningProfileInput {
  learning_goal: string;
  target_role?: string | null;
  learning_styles: ApiLearningStyle[];
  weekly_learning_hours: number;
}

export interface PreAssessmentInput {
  assessment_title: string;
  topic_scores: ApiTopicScore[];
  passing_score?: number;
}

/** Save the learner preferences used by the personalized path service. */
export function saveApiLearningProfile(input: LearningProfileInput, accessToken: string) {
  return apiRequest<ApiLearningProfile>("/api/learning/profile", {
    method: "PUT",
    token: accessToken,
    body: input,
  });
}

/** Read the current signed-in learner's saved preferences. */
export function getApiLearningProfile(accessToken: string) {
  return apiRequest<ApiLearningProfile>("/api/learning/profile", {
    method: "GET",
    token: accessToken,
  });
}

/** Submit topic scores calculated from the learner's completed pre-assessment. */
export function submitApiPreAssessment(input: PreAssessmentInput, accessToken: string) {
  return apiRequest<ApiPreAssessment>("/api/learning/pre-assessments", {
    method: "POST",
    token: accessToken,
    body: input,
  });
}

/** Load gap analysis for the latest assessment, or a specific assessment when supplied. */
export function getApiSkillGapAnalysis(accessToken: string, preAssessmentId?: number) {
  const query = preAssessmentId ? `?pre_assessment_id=${preAssessmentId}` : "";
  return apiRequest<ApiSkillGapAnalysis>(`/api/learning/skill-gap-analysis${query}`, {
    method: "GET",
    token: accessToken,
  });
}

/** Create a learner-specific recommendation order from their latest assessment. */
export function generateApiLearningPath(accessToken: string, preAssessmentId?: number) {
  return apiRequest<ApiPersonalizedLearningPath>("/api/learning/paths", {
    method: "POST",
    token: accessToken,
    body: preAssessmentId ? { pre_assessment_id: preAssessmentId } : {},
  });
}

/** Read the latest personalized path without creating a new version. */
export function getApiCurrentLearningPath(accessToken: string) {
  return apiRequest<ApiPersonalizedLearningPath>("/api/learning/paths/current", {
    method: "GET",
    token: accessToken,
  });
}
