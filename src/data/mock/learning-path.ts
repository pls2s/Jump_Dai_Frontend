import type { LearningActivityType } from "@/features/learner-journey/types";

export interface LearningPathCatalogItem {
  skillId: string;
  topicId: string;
  title: string;
  skillAddressed: string;
  baseMinutes: number;
  coreActivities: LearningActivityType[];
}

export const learningPathCatalog: LearningPathCatalogItem[] = [
  { skillId: "skill-marketing-fundamentals", topicId: "marketing-fundamentals", title: "Marketing Fundamentals", skillAddressed: "Connect campaign activity to audience needs and objectives", baseMinutes: 24, coreActivities: ["Lesson", "Quick quiz"] },
  { skillId: "skill-customer-journey", topicId: "customer-journey", title: "Mapping the Customer Journey", skillAddressed: "Match content and actions to each journey stage", baseMinutes: 36, coreActivities: ["Lesson", "Practice", "Scenario"] },
  { skillId: "skill-channel-strategy", topicId: "channel-strategy", title: "Channel Strategy and Campaign Execution", skillAddressed: "Choose channels using objective, audience, and measurement quality", baseMinutes: 34, coreActivities: ["Lesson", "Practice", "Quick quiz"] },
  { skillId: "skill-campaign-measurement", topicId: "campaign-measurement", title: "Choosing the Right Campaign Metrics", skillAddressed: "Evaluate campaign outcomes using meaningful metrics", baseMinutes: 40, coreActivities: ["Lesson", "Practice", "Quick quiz"] },
];
