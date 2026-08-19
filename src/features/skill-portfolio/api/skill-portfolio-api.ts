import { apiRequest } from "@/lib/api/api-client";

export type ApiCompetencyLevel = "FOUNDATION" | "DEVELOPING" | "PROFICIENT" | "ADVANCED";
export type ApiCredentialType = "DIGITAL_BADGE" | "CERTIFICATE";
export type ApiCredentialStatus = "VALID" | "REVOKED";

export interface ApiSkillEvidence {
  id: number;
  course_id: number;
  course_title: string;
  assessment_id: string;
  assessment_title: string;
  skill: string;
  score: number;
  passing_score: number;
  verified: boolean;
  competency_level: ApiCompetencyLevel;
  evidence_title: string;
  evidence_url: string | null;
  is_course_final_assessment: boolean;
  submitted_at: string;
}

export interface ApiVerifiedSkill {
  skill: string;
  competency_score: number;
  competency_level: ApiCompetencyLevel;
  evidence: ApiSkillEvidence[];
}

export interface ApiCredential {
  id: string;
  credential_type: ApiCredentialType;
  status: ApiCredentialStatus;
  learner_name: string;
  course_id: number | null;
  course_title: string | null;
  skill: string | null;
  competency_score: number | null;
  issued_at: string;
}

export interface ApiSkillPortfolio {
  learner_id: number;
  learner_name: string;
  skills: ApiVerifiedSkill[];
  credentials: ApiCredential[];
  generated_at: string;
}

export interface ApiPortfolioShare {
  share_token: string;
  share_url: string;
  created_at: string;
}

export interface ApiCredentialVerification {
  credential: ApiCredential;
  verified_at: string;
}

/** Read the signed-in learner's verified skills, evidence, and issued credentials. */
export function getApiSkillPortfolio(accessToken: string) {
  return apiRequest<ApiSkillPortfolio>("/api/skill-portfolio", {
    method: "GET",
    token: accessToken,
  });
}

/** Create or reuse the learner's backend share URL for a public portfolio view. */
export function createApiPortfolioShare(accessToken: string) {
  return apiRequest<ApiPortfolioShare>("/api/skill-portfolio/share", {
    method: "POST",
    token: accessToken,
  });
}

/** Verify a credential through the public backend verification endpoint. */
export function verifyApiCredential(credentialId: string) {
  return apiRequest<ApiCredentialVerification>(`/api/credentials/${encodeURIComponent(credentialId)}/verify`, {
    method: "GET",
  });
}
