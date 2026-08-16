export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CourseSetup {
  name: string;
  description: string;
  targetLearner: string;
  level: CourseLevel;
  objectives: string[];
  certificateEnabled: boolean;
  completionCriteria: "all-lessons" | "final-assessment";
}

export type SourceType = "PDF" | "Document" | "Slide" | "Text" | "URL";
export type SourceStatus = "Uploading" | "Uploaded" | "Processing" | "Ready" | "Failed";

export interface KnowledgeSource {
  id: string;
  name: string;
  type: SourceType;
  meta: string;
  status: SourceStatus;
  updatedAt: string;
  progress?: number;
}

export interface SourceReference {
  id: string;
  sourceName: string;
  location: string;
  excerpt: string;
}

export interface Concept {
  id: string;
  name: string;
  summary: string;
  sourceCount: number;
  references: SourceReference[];
}

export interface AnalysisTopic {
  id: string;
  name: string;
  conceptCount: number;
  sourceCount: number;
  concepts: Concept[];
}
