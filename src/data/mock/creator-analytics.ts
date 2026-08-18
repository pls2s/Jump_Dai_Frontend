import type {
  ContentAnalytics,
  CourseAnalytics,
  CreatorCourseAnalyticsSummary,
  SkillAnalytics,
} from "@/features/creator-analytics/types";

export const creatorCourseCatalog: CreatorCourseAnalyticsSummary[] = [
  {
    id: "digital-marketing-foundations",
    title: "Digital Marketing Foundations",
    status: "published",
    updatedAt: "Updated today",
  },
  {
    id: "ai-productivity-basics",
    title: "AI Productivity Basics",
    status: "published",
    updatedAt: "Published 8 days ago",
  },
  {
    id: "customer-experience-essentials",
    title: "Customer Experience Essentials",
    status: "review",
    updatedAt: "Updated yesterday",
  },
  {
    id: "customer-interview-essentials",
    title: "Customer Interview Essentials",
    status: "draft",
    updatedAt: "Updated 3 days ago",
  },
  {
    id: "content-planning-workshop",
    title: "Content Planning Workshop",
    status: "unpublished",
    updatedAt: "Unpublished 12 days ago",
  },
];

const digitalMarketingSkills: SkillAnalytics[] = [
  {
    skillId: "skill-customer-journey",
    name: "Customer Journey",
    preScore: 40,
    postScore: 82,
    improvement: 42,
    practicalPassRate: 72,
    retryRate: 8,
    commonChallenge: "Connecting touchpoints to a measurable next action.",
  },
  {
    skillId: "skill-campaign-measurement",
    name: "Campaign Measurement",
    preScore: 30,
    postScore: 70,
    improvement: 40,
    practicalPassRate: 54,
    retryRate: 22,
    commonChallenge: "Selecting outcome metrics instead of activity-only metrics.",
  },
  {
    skillId: "skill-channel-strategy",
    name: "Channel Strategy",
    preScore: 60,
    postScore: 78,
    improvement: 18,
    practicalPassRate: 68,
    retryRate: 13,
    commonChallenge: "Explaining why a channel fits both audience and objective.",
  },
  {
    skillId: "skill-marketing-fundamentals",
    name: "Marketing Fundamentals",
    preScore: 75,
    postScore: 90,
    improvement: 15,
    practicalPassRate: 81,
    retryRate: 5,
    commonChallenge: "Distinguishing funnel stages in less familiar scenarios.",
  },
];

const digitalMarketingContent: ContentAnalytics[] = [
  { id: "content-metrics", title: "Choosing the Right KPIs", type: "Lesson", completionRate: 61, quizScore: 58, retryRate: 22 },
  { id: "content-journey", title: "Mapping the Customer Journey", type: "Lesson", completionRate: 84, quizScore: 81, retryRate: 9 },
  { id: "content-channels", title: "Selecting Channels for Campaign Goals", type: "Practice", completionRate: 76, quizScore: 74, retryRate: 14 },
  { id: "content-funnel", title: "Marketing Funnel Refresher", type: "Quiz", completionRate: 93, quizScore: 88, retryRate: 4 },
];

export const creatorAnalyticsFixtures: CourseAnalytics[] = [
  {
    courseId: "digital-marketing-foundations",
    title: "Digital Marketing Foundations",
    status: "published",
    learnerCount: 164,
    activeLearners: 128,
    courseStarts: 164,
    completions: 118,
    completionRate: 72,
    averageAssessmentScore: 78,
    practicalPassRate: 69,
    verifiedSkills: 246,
    funnel: [
      { id: "started", label: "Started course", value: 164 },
      { id: "onboarding", label: "Completed onboarding", value: 151 },
      { id: "pre-assessment", label: "Completed Pre-Assessment", value: 144 },
      { id: "learning-path", label: "Started Learning Path", value: 138 },
      { id: "learning", label: "Completed learning", value: 126 },
      { id: "assessment", label: "Completed assessment", value: 121 },
      { id: "practical", label: "Completed practical", value: 118 },
      { id: "completed", label: "Completed course", value: 118 },
    ],
    assessment: {
      preAssessmentAverage: 52,
      postAssessmentAverage: 78,
      averageImprovement: 26,
      practicalPassRate: 69,
    },
    skills: digitalMarketingSkills,
    content: digitalMarketingContent,
  },
  {
    courseId: "ai-productivity-basics",
    title: "AI Productivity Basics",
    status: "published",
    learnerCount: 0,
    activeLearners: 0,
    courseStarts: 0,
    completions: 0,
    completionRate: 0,
    averageAssessmentScore: 0,
    practicalPassRate: 0,
    verifiedSkills: 0,
    funnel: [
      { id: "started", label: "Started course", value: 0 },
      { id: "onboarding", label: "Completed onboarding", value: 0 },
      { id: "pre-assessment", label: "Completed Pre-Assessment", value: 0 },
      { id: "learning-path", label: "Started Learning Path", value: 0 },
      { id: "learning", label: "Completed learning", value: 0 },
      { id: "assessment", label: "Completed assessment", value: 0 },
      { id: "practical", label: "Completed practical", value: 0 },
      { id: "completed", label: "Completed course", value: 0 },
    ],
    assessment: {
      preAssessmentAverage: 0,
      postAssessmentAverage: 0,
      averageImprovement: 0,
      practicalPassRate: 0,
    },
    skills: [],
    content: [],
  },
];

export const analyticsTimeRangeLabels = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
} as const;
