import type {
  OrganizationActivity,
  OrganizationIdentity,
  OrganizationLearner,
} from "@/features/organization/types";

export const DEMO_ORGANIZATION: OrganizationIdentity = {
  id: "skillsync-demo-organization",
  name: "SkillSync Demo Organization",
  learningFocus: "Practical digital and customer experience skills",
};

export const organizationCourseOwners: Record<string, string> = {
  "digital-marketing-foundations": "Creator Demo",
  "ai-productivity-basics": "Creator Demo",
  "customer-experience-essentials": "Maya Rodriguez",
  "customer-interview-essentials": "Jordan Lee",
  "content-planning-workshop": "Creator Demo",
};

/** Fictional, learning-only records for frontend Organization review. */
export const organizationLearners: OrganizationLearner[] = [
  {
    id: "learner-maya-chen",
    name: "Maya Chen",
    currentLearning: [{ courseId: "digital-marketing-foundations", courseTitle: "Digital Marketing Foundations", progress: 100, status: "completed" }],
    completedCourses: 1,
    verifiedSkills: ["Customer Journey", "Marketing Fundamentals", "Channel Strategy"],
    lastActivity: "Completed Digital Marketing Foundations today",
  },
  {
    id: "learner-noah-williams",
    name: "Noah Williams",
    currentLearning: [{ courseId: "digital-marketing-foundations", courseTitle: "Digital Marketing Foundations", progress: 78, status: "active" }],
    completedCourses: 0,
    verifiedSkills: ["Marketing Fundamentals"],
    lastActivity: "Submitted the practical assessment yesterday",
  },
  {
    id: "learner-priya-shah",
    name: "Priya Shah",
    currentLearning: [{ courseId: "digital-marketing-foundations", courseTitle: "Digital Marketing Foundations", progress: 62, status: "active" }],
    completedCourses: 0,
    verifiedSkills: ["Customer Journey"],
    lastActivity: "Completed Customer Journey practice yesterday",
  },
  {
    id: "learner-ethan-kim",
    name: "Ethan Kim",
    currentLearning: [{ courseId: "digital-marketing-foundations", courseTitle: "Digital Marketing Foundations", progress: 44, status: "active" }],
    completedCourses: 0,
    verifiedSkills: [],
    lastActivity: "Continued Channel Strategy 2 days ago",
  },
  {
    id: "learner-sofia-martin",
    name: "Sofia Martin",
    currentLearning: [{ courseId: "digital-marketing-foundations", courseTitle: "Digital Marketing Foundations", progress: 18, status: "active" }],
    completedCourses: 0,
    verifiedSkills: [],
    lastActivity: "Completed the Pre-Assessment 3 days ago",
  },
  {
    id: "learner-liam-brown",
    name: "Liam Brown",
    currentLearning: [{ courseId: "ai-productivity-basics", courseTitle: "AI Productivity Basics", progress: 0, status: "not-started" }],
    completedCourses: 0,
    verifiedSkills: [],
    lastActivity: "Course access assigned 4 days ago",
  },
];

export const organizationSkillLearnerCounts: Record<string, number> = {
  "skill-customer-journey": 82,
  "skill-campaign-measurement": 64,
  "skill-channel-strategy": 68,
  "skill-marketing-fundamentals": 96,
};

export const organizationRecentActivity: OrganizationActivity[] = [
  { id: "activity-completion", label: "Course completion", detail: "Maya Chen completed Digital Marketing Foundations.", occurredAt: "Today" },
  { id: "activity-practical", label: "Practical assessment", detail: "Noah Williams submitted a Digital Campaign Plan.", occurredAt: "Yesterday" },
  { id: "activity-skill", label: "Verified skill", detail: "12 Customer Journey skill records were verified this week.", occurredAt: "2 days ago" },
];
