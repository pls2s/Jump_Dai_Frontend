import type {
  LearnerJourneyState,
  SkillVerificationStatus,
} from "@/features/learner-journey/types";

export type SkillEvidenceType =
  | "pre-assessment"
  | "post-assessment"
  | "quiz"
  | "practical-assessment"
  | "learning-activity"
  | "creator-verified"
  | "credential";

export type SkillEvidenceStatus =
  | "recorded"
  | "completed"
  | "passed"
  | "verified";

export interface EvidenceRubricItem {
  label: string;
  earned: number;
  possible: number;
}

export interface SkillEvidence {
  id: string;
  type: SkillEvidenceType;
  title: string;
  description: string;
  courseTitle: string;
  score?: number;
  status: SkillEvidenceStatus;
  createdAt: string;
  verified: boolean;
  activityCount?: number;
  rubric?: EvidenceRubricItem[];
  resultHref: string;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  competencyScore: number;
  beforeScore: number;
  improvement: number;
  status: SkillVerificationStatus;
  statusReason: string;
  courseId: string;
  courseTitle: string;
  evidence: SkillEvidence[];
  verifiedAt?: string;
  nextActionHref?: string;
  nextActionLabel?: string;
}

export type CredentialStatus =
  | "not-eligible"
  | "eligible"
  | "issued"
  | "revoked";

export interface CredentialRequirement {
  id: string;
  label: string;
  met: boolean;
  detail: string;
}

export interface SkillSyncCredential {
  id: string;
  title: string;
  status: CredentialStatus;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  issueDate?: string;
  verifiedSkillIds: string[];
  assessmentScore?: number;
  practicalScore?: number;
  evidenceSummary?: string;
  requirements: CredentialRequirement[];
  certificateOffered: boolean;
}

export interface PortfolioTimelineItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  href: string;
}

export interface SkillPortfolioSummary {
  verifiedSkills: number;
  developingSkills: number;
  completedCourses: number;
  credentials: number;
  learningInProgress: number;
}

export interface SkillPortfolioSnapshot {
  learnerId: number;
  learnerName: string;
  learningFocus: string;
  courseId: string;
  courseTitle: string;
  skills: PortfolioSkill[];
  evidence: SkillEvidence[];
  timeline: PortfolioTimelineItem[];
  credential: SkillSyncCredential;
  summary: SkillPortfolioSummary;
  journey: LearnerJourneyState;
}

export type PortfolioPreviewState =
  | "default"
  | "empty"
  | "partial"
  | "not-eligible"
  | "eligible"
  | "issued"
  | "certificate-disabled";

export type PortfolioTab = "overview" | "skills" | "evidence" | "credentials";
