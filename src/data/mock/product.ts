import type {
  AnalysisTopic,
  CourseSetup,
  KnowledgeSource,
} from "@/types/product";

export const defaultCourseSetup: CourseSetup = {
  name: "Digital Marketing Foundations",
  description:
    "Learn the core concepts and practical skills needed to plan and evaluate digital marketing campaigns.",
  targetLearner:
    "Early-career marketers and small business owners who want to build practical digital marketing skills.",
  level: "Beginner",
  objectives: [
    "Explain the core digital marketing funnel.",
    "Identify suitable channels for different campaign goals.",
    "Evaluate basic campaign performance using key metrics.",
  ],
  certificateEnabled: true,
  completionCriteria: "all-lessons",
};

export const FRONTEND_PREVIEW_COURSE_ID = "demo-course-1";

export const frontendPreviewCourse = {
  id: FRONTEND_PREVIEW_COURSE_ID,
  name: "Digital Marketing Foundations",
  status: "Draft",
  currentStep: "Knowledge Sources",
  updatedAt: "Frontend preview fixture",
  progress: 64,
} as const;

export const mockCourses = [
  {
    id: "digital-marketing-foundations",
    name: "Digital Marketing Foundations",
    status: "Draft",
    currentStep: "Knowledge Sources",
    updatedAt: "Updated today",
    progress: 64,
  },
  {
    id: "customer-interview-essentials",
    name: "Customer Interview Essentials",
    status: "Draft",
    currentStep: "Course setup",
    updatedAt: "Updated 3 days ago",
    progress: 28,
  },
] as const;

export function getMockCourse(courseId: string) {
  return mockCourses.find((course) => course.id === courseId)
    ?? (courseId === FRONTEND_PREVIEW_COURSE_ID ? frontendPreviewCourse : undefined);
}

export function isKnownCourseRouteId(courseId: string) {
  return Boolean(getMockCourse(courseId)) || /^\d+$/.test(courseId);
}

export const initialKnowledgeSources: KnowledgeSource[] = [
  {
    id: "source-guide",
    name: "Digital-Marketing-Guide.pdf",
    type: "PDF",
    meta: "4.2 MB",
    status: "Ready",
    updatedAt: "Today, 10:42",
  },
  {
    id: "source-notes",
    name: "Campaign Planning Notes",
    type: "Text",
    meta: "1,240 words",
    status: "Ready",
    updatedAt: "Today, 10:45",
  },
  {
    id: "source-deck",
    name: "Channel-Strategy-Workshop.pptx",
    type: "Slide",
    meta: "8.7 MB",
    status: "Failed",
    updatedAt: "Today, 10:47",
  },
];

export const analysisSummary = {
  sourcesAnalyzed: 3,
  topicsIdentified: 5,
  conceptsExtracted: 21,
  referencesLinked: 31,
};

export const analysisTopics: AnalysisTopic[] = [
  {
    id: "marketing-fundamentals",
    name: "Marketing Fundamentals",
    conceptCount: 5,
    sourceCount: 3,
    concepts: [
      {
        id: "marketing-funnel",
        name: "The Marketing Funnel",
        summary:
          "The marketing funnel organizes the customer journey into stages so teams can align messages and actions with changing customer needs.",
        sourceCount: 3,
        references: [
          {
            id: "ref-funnel-guide",
            sourceName: "Digital-Marketing-Guide.pdf",
            location: "Page 8",
            excerpt:
              "A funnel helps teams match campaign objectives with the audience's current level of intent.",
          },
          {
            id: "ref-funnel-notes",
            sourceName: "Campaign Planning Notes",
            location: "Section: Funnel Strategy",
            excerpt:
              "Start planning with the audience's current stage, then choose a useful next action.",
          },
        ],
      },
    ],
  },
  {
    id: "customer-journey",
    name: "Customer Journey",
    conceptCount: 4,
    sourceCount: 2,
    concepts: [
      {
        id: "awareness-stage",
        name: "Awareness Stage",
        summary:
          "The awareness stage focuses on reaching audiences who have not yet actively considered the product or service.",
        sourceCount: 2,
        references: [
          {
            id: "ref-awareness-guide",
            sourceName: "Digital-Marketing-Guide.pdf",
            location: "Page 12",
            excerpt:
              "Awareness activities focus on introducing the problem or brand before asking for a high-commitment action.",
          },
          {
            id: "ref-awareness-notes",
            sourceName: "Campaign Planning Notes",
            location: "Section: Funnel Strategy",
            excerpt:
              "Use broad-reach education to earn attention before moving audiences toward consideration.",
          },
        ],
      },
      {
        id: "consideration-stage",
        name: "Consideration Stage",
        summary:
          "During consideration, learners compare approaches and need proof that a solution fits their specific goals.",
        sourceCount: 2,
        references: [
          {
            id: "ref-consideration-guide",
            sourceName: "Digital-Marketing-Guide.pdf",
            location: "Page 15",
            excerpt:
              "Comparison content and practical examples help people evaluate whether an offer fits their needs.",
          },
        ],
      },
    ],
  },
  {
    id: "content-strategy",
    name: "Content Strategy",
    conceptCount: 4,
    sourceCount: 2,
    concepts: [
      {
        id: "content-purpose",
        name: "Content Purpose",
        summary:
          "Every content asset should serve a defined audience need and a measurable campaign objective.",
        sourceCount: 2,
        references: [
          {
            id: "ref-content-purpose",
            sourceName: "Campaign Planning Notes",
            location: "Section: Content Planning",
            excerpt:
              "Assign each content idea one primary audience need and one desired action.",
          },
        ],
      },
    ],
  },
  {
    id: "paid-media",
    name: "Paid Media",
    conceptCount: 3,
    sourceCount: 2,
    concepts: [
      {
        id: "campaign-objectives",
        name: "Campaign Objectives",
        summary:
          "Paid media objectives connect delivery optimization to the business outcome a campaign is designed to influence.",
        sourceCount: 2,
        references: [
          {
            id: "ref-paid-objectives",
            sourceName: "Digital-Marketing-Guide.pdf",
            location: "Page 28",
            excerpt:
              "Choose an optimization event that reflects the most meaningful action available at the campaign stage.",
          },
        ],
      },
    ],
  },
  {
    id: "campaign-measurement",
    name: "Campaign Measurement",
    conceptCount: 5,
    sourceCount: 3,
    concepts: [
      {
        id: "key-metrics",
        name: "Key Performance Metrics",
        summary:
          "Useful metrics show whether the campaign is producing the intended audience behavior, not only generating activity.",
        sourceCount: 3,
        references: [
          {
            id: "ref-key-metrics",
            sourceName: "Digital-Marketing-Guide.pdf",
            location: "Page 36",
            excerpt:
              "Interpret reach and engagement alongside conversion outcomes to understand campaign quality.",
          },
        ],
      },
    ],
  },
];

export const learningSequence = [
  "Marketing Fundamentals",
  "Customer Journey",
  "Content Strategy",
  "Channel Strategy",
  "Campaign Measurement",
];

export const processingSteps = [
  "Reading knowledge sources",
  "Extracting key topics",
  "Summarizing concepts",
  "Mapping topic relationships",
  "Building learning sequence",
  "Retrieving grounded source context",
  "Linking source references",
] as const;
