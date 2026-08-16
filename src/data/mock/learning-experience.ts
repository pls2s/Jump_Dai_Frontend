import { generatedCourseTemplate } from "@/data/mock/generated-course";
import { digitalMarketingPreAssessment } from "@/data/mock/pre-assessment";
import type {
  AssessmentResponse,
  KnowledgeCheckDefinition,
  LearnerLesson,
  PersonalizedLearningPath,
  PracticalDraft,
} from "@/features/learner-journey/types";

export const QUICK_QUIZ_PASSING_SCORE = 60;
export const POST_ASSESSMENT_PASSING_SCORE = 70;
export const PRACTICAL_ASSESSMENT_PASSING_SCORE = 70;

const topicModuleIds: Record<string, string> = {
  "marketing-fundamentals": "module-marketing-fundamentals",
  "customer-journey": "module-customer-content",
  "channel-strategy": "module-channel-execution",
  "campaign-measurement": "module-measurement",
};

const lessonEnhancements: Record<string, { keyConcepts: string[]; example: string }> = {
  "lesson-digital-marketing-role": { keyConcepts: ["Audience need", "Desired action", "Measurable outcome"], example: "A local service business connects an appointment goal to nearby customers who are actively searching." },
  "lesson-marketing-funnel": { keyConcepts: ["Awareness", "Consideration", "Conversion"], example: "An introductory guide supports awareness, while a comparison page helps consideration." },
  "lesson-customer-journey": { keyConcepts: ["Journey stage", "Audience question", "Useful next action"], example: "A first-time visitor needs orientation before they are asked to book or buy." },
  "lesson-content-purpose": { keyConcepts: ["Primary need", "Content role", "Call to action"], example: "A checklist answers one planning question and leads to a relevant template." },
  "lesson-channel-selection": { keyConcepts: ["Objective fit", "Audience behavior", "Measurement quality"], example: "High-intent local search supports near-term bookings better than broad untargeted reach." },
  "lesson-campaign-plan": { keyConcepts: ["Objective", "Audience", "Message", "Channel role", "Metric"], example: "A coherent plan traces one desired action from message through channel to measurement." },
  "lesson-meaningful-metrics": { keyConcepts: ["Activity metric", "Outcome metric", "Efficiency metric"], example: "Reach describes delivery; conversion rate and cost per acquisition show business impact." },
  "lesson-optimization": { keyConcepts: ["Performance gap", "Testable change", "Controlled comparison"], example: "Improve one weak landing-page step while keeping the campaign audience stable." },
};

export function buildPersonalizedLessonSequence(path: PersonalizedLearningPath): LearnerLesson[] {
  return path.items.flatMap((pathItem) => {
    const courseModule = generatedCourseTemplate.modules.find((item) => item.id === topicModuleIds[pathItem.topicId]);
    const lessons = pathItem.emphasis === "quick-refresher" ? courseModule?.lessons.slice(0, 1) : courseModule?.lessons;
    return (lessons ?? []).map((lesson) => ({
      id: lesson.id,
      pathItemId: pathItem.id,
      moduleTitle: courseModule?.title ?? pathItem.title,
      title: lesson.title,
      learningObjective: lesson.learningObjective,
      summary: lesson.summary,
      keyConcepts: lessonEnhancements[lesson.id]?.keyConcepts ?? [],
      example: lessonEnhancements[lesson.id]?.example ?? lesson.summary,
      practicePrompt: lesson.exercise?.prompt,
      sourceNames: Array.from(new Set(lesson.references.map((reference) => reference.sourceName))),
      estimatedMinutes: Math.max(6, Math.round(pathItem.estimatedMinutes / Math.max(lessons?.length ?? 1, 1))),
      skillId: pathItem.skillId,
      emphasis: pathItem.emphasis,
      personalizationReason: pathItem.reason,
      quickCheckId: lesson.quiz ? `quick-${lesson.quiz.id}` : undefined,
    }));
  });
}

export function getQuickCheckDefinition(quickCheckId: string): KnowledgeCheckDefinition | undefined {
  for (const courseModule of generatedCourseTemplate.modules) {
    for (const lesson of courseModule.lessons) {
      if (!lesson.quiz || `quick-${lesson.quiz.id}` !== quickCheckId) continue;
      const topicId = Object.entries(topicModuleIds).find(([, moduleId]) => moduleId === courseModule.id)?.[0] ?? "marketing-fundamentals";
      const skillId = topicId === "customer-journey" ? "skill-customer-journey" : topicId === "channel-strategy" ? "skill-channel-strategy" : topicId === "campaign-measurement" ? "skill-campaign-measurement" : "skill-marketing-fundamentals";
      return {
        id: quickCheckId,
        courseId: generatedCourseTemplate.id,
        kind: "quick-quiz",
        title: "Quick knowledge check",
        description: `Check your understanding of ${lesson.title}.`,
        estimatedMinutes: "About 3 minutes",
        passingScore: QUICK_QUIZ_PASSING_SCORE,
        sourceLessonId: lesson.id,
        questions: [{ id: `question-${lesson.quiz.id}`, topicId, skillId, type: "multiple-choice", prompt: lesson.quiz.question, options: lesson.quiz.options, explanation: lesson.quiz.explanation, difficulty: "beginner" }],
      };
    }
  }
  return undefined;
}

export const postAssessmentDefinition: KnowledgeCheckDefinition = {
  id: "post-assessment-digital-marketing-v1",
  courseId: generatedCourseTemplate.id,
  kind: "post-assessment",
  title: "Final knowledge check",
  description: "Measure the same core competencies again so you can see what changed after learning.",
  estimatedMinutes: "5–10 minutes",
  passingScore: POST_ASSESSMENT_PASSING_SCORE,
  questions: digitalMarketingPreAssessment.questions.map((question) => ({ ...question, id: `post-${question.id}` })),
};

export const demoPostAssessmentResponses: AssessmentResponse[] = [
  { questionId: "post-question-funnel-awareness", selectedOptionIds: ["a"] },
  { questionId: "post-question-planning-start", selectedOptionIds: ["b"] },
  { questionId: "post-question-journey-map", selectedOptionIds: ["b"] },
  { questionId: "post-question-content-purpose", selectedOptionIds: ["a", "b"] },
  { questionId: "post-question-channel-scenario", selectedOptionIds: ["a"] },
  { questionId: "post-question-channel-factors", selectedOptionIds: ["a", "b", "d"] },
  { questionId: "post-question-metric-objective", selectedOptionIds: ["c"] },
  { questionId: "post-question-measurement-combination", selectedOptionIds: ["b"] },
];

export const practicalAssessmentDefinition = {
  id: "practical-digital-campaign-plan",
  title: "Create a simple digital campaign plan",
  brief: "Apply the course by connecting one campaign objective to an audience, suitable channels, a core message, and meaningful measurement.",
  expectedOutcome: "A concise campaign plan whose decisions support one another and can be evaluated.",
  estimatedTime: "30–45 minutes",
  passingScore: PRACTICAL_ASSESSMENT_PASSING_SCORE,
  criteria: [
    { id: "objective", label: "Campaign objective", weight: 25, description: "Defines a clear, measurable campaign outcome." },
    { id: "audience", label: "Audience alignment", weight: 20, description: "Connects the plan to a specific audience need." },
    { id: "channel", label: "Channel rationale", weight: 25, description: "Explains why selected channels fit the objective and audience." },
    { id: "measurement", label: "Measurement plan", weight: 30, description: "Uses metrics that reflect both activity and intended outcomes." },
  ],
} as const;

export const emptyPracticalDraft: PracticalDraft = { objective: "", targetAudience: "", channelSelection: "", coreMessage: "", measurementMetrics: "" };

export const demoPracticalDraft: PracticalDraft = {
  objective: "Generate 40 qualified consultation bookings from local small-business owners during a six-week campaign.",
  targetAudience: "Small-business owners in Bangkok who manage their own marketing and need a practical campaign planning process.",
  channelSelection: "Use locally targeted search for active demand and a short educational social series for consideration, each linked to the booking page.",
  coreMessage: "Turn your next campaign into a clear plan you can measure and improve.",
  measurementMetrics: "Track qualified booking conversion rate, cost per qualified booking, landing-page completion rate, and assisted conversions by channel.",
};
