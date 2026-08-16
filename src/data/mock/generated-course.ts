import type { GeneratedCourse, SourceReference } from "@/types/product";

const guideFunnel: SourceReference = {
  id: "generated-ref-guide-funnel",
  sourceName: "Digital-Marketing-Guide.pdf",
  location: "Page 8",
  excerpt: "A funnel helps teams match campaign objectives with the audience's current level of intent.",
};

const guideAwareness: SourceReference = {
  id: "generated-ref-guide-awareness",
  sourceName: "Digital-Marketing-Guide.pdf",
  location: "Page 12",
  excerpt: "Awareness activities introduce the problem or brand before asking for a high-commitment action.",
};

const planningNotes: SourceReference = {
  id: "generated-ref-planning-notes",
  sourceName: "Campaign Planning Notes",
  location: "Section: Funnel Strategy",
  excerpt: "Start planning with the audience's current stage, then choose a useful next action.",
};

const contentNotes: SourceReference = {
  id: "generated-ref-content-notes",
  sourceName: "Campaign Planning Notes",
  location: "Section: Content Planning",
  excerpt: "Assign each content idea one primary audience need and one desired action.",
};

const channelDeck: SourceReference = {
  id: "generated-ref-channel-deck",
  sourceName: "Campaign Planning Notes",
  location: "Section: Channel Selection",
  excerpt: "Channel choice should follow the campaign objective, audience behavior, and available measurement signal.",
};

const measurementGuide: SourceReference = {
  id: "generated-ref-measurement-guide",
  sourceName: "Digital-Marketing-Guide.pdf",
  location: "Page 36",
  excerpt: "Interpret reach and engagement alongside conversion outcomes to understand campaign quality.",
};

export const generatedCourseTemplate: GeneratedCourse = {
  id: "digital-marketing-foundations",
  title: "Digital Marketing Foundations",
  description: "Learn the core concepts and practical skills needed to plan and evaluate digital marketing campaigns.",
  targetLearner: "Early-career marketers and small business owners who want to build practical digital marketing skills.",
  level: "Beginner",
  learningObjectives: [
    "Explain the core digital marketing funnel.",
    "Identify suitable channels for different campaign goals.",
    "Evaluate basic campaign performance using key metrics.",
  ],
  certificateEnabled: true,
  completionCriteria: "all-lessons",
  modules: [
    {
      id: "module-marketing-fundamentals",
      title: "Marketing Fundamentals",
      description: "Build a shared foundation for how digital marketing creates value across the customer journey.",
      lessons: [
        {
          id: "lesson-digital-marketing-role",
          title: "Understanding Digital Marketing",
          learningObjective: "Explain the role of digital marketing within the customer journey.",
          summary: "Digital marketing connects audience needs, useful messages, channels, and measurable actions. Effective planning begins with a clear learner-friendly view of the customer journey rather than with a list of tools.",
          references: [guideFunnel, planningNotes],
          exercise: {
            id: "exercise-digital-marketing-role",
            prompt: "Describe one business goal and identify the customer behavior that would show meaningful progress toward it.",
          },
          quiz: {
            id: "quiz-digital-marketing-role",
            question: "Which starting point best supports a useful digital marketing plan?",
            options: [
              { id: "a", text: "Choose the newest platform", isCorrect: false },
              { id: "b", text: "Define the audience need and desired action", isCorrect: true },
              { id: "c", text: "Maximize the number of channels", isCorrect: false },
            ],
            explanation: "Audience need and desired action provide the basis for choosing relevant messages, channels, and measures.",
          },
        },
        {
          id: "lesson-marketing-funnel",
          title: "The Marketing Funnel",
          learningObjective: "Describe how audience needs change across awareness, consideration, and conversion.",
          summary: "The marketing funnel is a planning model that helps teams align content and calls to action with an audience's current level of intent.",
          references: [guideFunnel, guideAwareness],
          exercise: {
            id: "exercise-marketing-funnel",
            prompt: "Match three campaign messages to awareness, consideration, or conversion and explain each choice.",
          },
        },
      ],
    },
    {
      id: "module-customer-content",
      title: "Customer Journey and Content Strategy",
      description: "Connect customer intent with content that supports a useful next step.",
      lessons: [
        {
          id: "lesson-customer-journey",
          title: "Mapping the Customer Journey",
          learningObjective: "Map audience questions and decisions across the customer journey.",
          summary: "Journey mapping makes changing audience questions visible so each campaign stage can offer appropriate information and a realistic next action.",
          references: [guideAwareness, planningNotes],
          quiz: {
            id: "quiz-customer-journey",
            question: "What is the most suitable awareness-stage outcome?",
            options: [
              { id: "a", text: "Immediate repeat purchase", isCorrect: false },
              { id: "b", text: "Recognition of the problem or brand", isCorrect: true },
              { id: "c", text: "Contract renewal", isCorrect: false },
            ],
            explanation: "Awareness activity earns attention and introduces a problem or brand before high-commitment actions.",
          },
        },
        {
          id: "lesson-content-purpose",
          title: "Planning Content with Purpose",
          learningObjective: "Connect each content asset to an audience need and campaign objective.",
          summary: "Purposeful content has one primary audience need, one intended action, and a role in the wider journey. This focus makes content easier to evaluate and improve.",
          references: [contentNotes, guideFunnel],
          exercise: {
            id: "exercise-content-purpose",
            prompt: "Rewrite three broad content ideas so each has one audience need and one desired action.",
          },
        },
      ],
    },
    {
      id: "module-channel-execution",
      title: "Channel Strategy and Campaign Execution",
      description: "Choose channels deliberately and turn a campaign objective into a practical execution plan.",
      lessons: [
        {
          id: "lesson-channel-selection",
          title: "Selecting the Right Channels",
          learningObjective: "Identify suitable channels for different campaign goals and audience behaviors.",
          summary: "Channel selection balances the objective, audience behavior, message format, budget, and the quality of the measurement signal available.",
          references: [channelDeck, planningNotes],
          exercise: {
            id: "exercise-channel-selection",
            prompt: "Choose the most suitable channel for three different campaign objectives and explain your reasoning.",
          },
          quiz: {
            id: "quiz-channel-selection",
            question: "Which factor should guide channel selection first?",
            options: [
              { id: "a", text: "The campaign objective and audience behavior", isCorrect: true },
              { id: "b", text: "The team's favorite platform", isCorrect: false },
              { id: "c", text: "The number of available ad formats", isCorrect: false },
            ],
            explanation: "A relevant channel must support the intended audience action in a place the audience actually uses.",
          },
        },
        {
          id: "lesson-campaign-plan",
          title: "Building a Campaign Plan",
          learningObjective: "Create a coherent campaign plan from objective through measurement.",
          summary: "A practical campaign plan connects the objective, audience, message, channel roles, timing, ownership, and measurement before execution begins.",
          references: [planningNotes, channelDeck],
          exercise: {
            id: "exercise-campaign-plan",
            prompt: "Draft a one-page campaign plan using the provided objective, audience, message, channel, and metric headings.",
          },
        },
      ],
    },
    {
      id: "module-measurement",
      title: "Measurement and Optimization",
      description: "Use meaningful metrics to evaluate campaign quality and decide what to improve.",
      lessons: [
        {
          id: "lesson-meaningful-metrics",
          title: "Choosing Meaningful Metrics",
          learningObjective: "Select metrics that reflect the intended audience behavior and campaign objective.",
          summary: "Useful measurement connects activity indicators such as reach and engagement with outcomes such as qualified actions and conversions.",
          references: [measurementGuide, guideFunnel],
          quiz: {
            id: "quiz-meaningful-metrics",
            question: "Why should reach be interpreted with outcome metrics?",
            options: [
              { id: "a", text: "Reach alone does not show whether the intended action occurred", isCorrect: true },
              { id: "b", text: "Reach cannot be measured digitally", isCorrect: false },
              { id: "c", text: "Outcome metrics are always larger", isCorrect: false },
            ],
            explanation: "Activity and outcome metrics together show both delivery and whether meaningful audience behavior followed.",
          },
        },
        {
          id: "lesson-optimization",
          title: "Evaluating and Optimizing Campaigns",
          learningObjective: "Evaluate basic campaign performance and recommend a focused improvement.",
          summary: "Optimization compares results with the intended objective, isolates the most useful learning, and changes one important variable at a time.",
          references: [measurementGuide, planningNotes],
          exercise: {
            id: "exercise-optimization",
            prompt: "Review a simple campaign report, identify the largest performance gap, and recommend one testable improvement.",
          },
        },
      ],
    },
  ],
  practicalTask: {
    id: "practical-campaign-plan",
    title: "Create a Digital Campaign Plan",
    instructions: "Create a simple digital campaign plan that connects a clear business objective with an audience, selected channels, a core message, and measurement metrics.",
    deliverables: [
      "Campaign objective",
      "Target audience",
      "Selected channels and rationale",
      "Core message",
      "Measurement metrics",
    ],
    rubric: [
      { id: "rubric-alignment", criterion: "Strategic alignment", description: "Objective, audience, message, and channel choices support one another.", weight: 40 },
      { id: "rubric-rationale", criterion: "Decision rationale", description: "Channel and message choices are explained using course concepts.", weight: 35 },
      { id: "rubric-measurement", criterion: "Measurement", description: "Metrics reflect the intended audience action and campaign goal.", weight: 25 },
    ],
    references: [planningNotes, channelDeck, measurementGuide],
  },
  finalAssessment: {
    id: "final-assessment-campaign",
    title: "Digital Marketing Foundations Assessment",
    instructions: "Complete a scenario-based assessment covering funnel planning, channel selection, and campaign measurement. Explain the reasoning behind each recommendation.",
    passingScore: 70,
    objectiveCoverage: ["LO1", "LO2", "LO3"],
    references: [guideFunnel, channelDeck, measurementGuide],
  },
};

export const generationSteps = [
  "Preparing course structure",
  "Mapping topics to learning objectives",
  "Building modules and lessons",
  "Creating exercises",
  "Creating quizzes",
  "Creating practical assessment",
  "Creating final assessment",
] as const;
