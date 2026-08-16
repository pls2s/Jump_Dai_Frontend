import type { AssessmentResponse, AssessmentSkill, PreAssessmentDefinition } from "@/features/learner-journey/types";

export const assessmentSkills: AssessmentSkill[] = [
  { id: "skill-marketing-fundamentals", topicId: "marketing-fundamentals", name: "Marketing Fundamentals", whyItMatters: "Core marketing concepts help you connect campaign activity to a clear audience need and outcome.", strengthMessage: "You already demonstrate a solid understanding of core marketing concepts." },
  { id: "skill-customer-journey", topicId: "customer-journey", name: "Customer Journey", whyItMatters: "Understanding the customer journey helps you match content and actions to what people need at each stage.", strengthMessage: "You can confidently connect customer needs with the right journey stage." },
  { id: "skill-channel-strategy", topicId: "channel-strategy", name: "Channel Strategy", whyItMatters: "Thoughtful channel choices help campaigns reach the right audience in a useful, measurable way.", strengthMessage: "You show strong judgment when matching channels to campaign goals." },
  { id: "skill-campaign-measurement", topicId: "campaign-measurement", name: "Campaign Measurement", whyItMatters: "Understanding campaign metrics helps you evaluate whether a campaign is meeting its objective.", strengthMessage: "You can connect campaign activity with meaningful performance measures." },
];

export const digitalMarketingPreAssessment: PreAssessmentDefinition = {
  id: "pre-assessment-digital-marketing-v1",
  courseId: "digital-marketing-foundations",
  title: "Digital Marketing Foundations pre-assessment",
  estimatedMinutes: "5–10 minutes",
  questions: [
    {
      id: "question-funnel-awareness",
      topicId: "marketing-fundamentals",
      skillId: "skill-marketing-fundamentals",
      type: "multiple-choice",
      prompt: "Which outcome best fits the awareness stage of the marketing funnel?",
      options: [
        { id: "a", text: "A first introduction to the problem or brand", isCorrect: true },
        { id: "b", text: "A repeat purchase from an existing customer", isCorrect: false },
        { id: "c", text: "A signed annual contract", isCorrect: false },
        { id: "d", text: "A completed customer-support request", isCorrect: false },
      ],
      explanation: "Awareness activity helps an audience recognize a problem or brand before asking for a high-commitment action.",
      difficulty: "beginner",
    },
    {
      id: "question-planning-start",
      topicId: "marketing-fundamentals",
      skillId: "skill-marketing-fundamentals",
      type: "multiple-choice",
      prompt: "What is the most useful starting point for a digital campaign plan?",
      options: [
        { id: "a", text: "Choose as many channels as possible", isCorrect: false },
        { id: "b", text: "Define the audience need and desired action", isCorrect: true },
        { id: "c", text: "Copy the most recent competitor campaign", isCorrect: false },
        { id: "d", text: "Set the largest available budget", isCorrect: false },
      ],
      explanation: "Audience need and desired action give the campaign a clear basis for its message, channels, and measurement.",
      difficulty: "beginner",
    },
    {
      id: "question-journey-map",
      topicId: "customer-journey",
      skillId: "skill-customer-journey",
      type: "multiple-choice",
      prompt: "Why do marketers map the customer journey?",
      options: [
        { id: "a", text: "To use the same message at every stage", isCorrect: false },
        { id: "b", text: "To understand changing questions and useful next actions", isCorrect: true },
        { id: "c", text: "To remove the need for campaign objectives", isCorrect: false },
        { id: "d", text: "To guarantee an immediate purchase", isCorrect: false },
      ],
      explanation: "Journey mapping makes changing audience questions visible so each stage can offer appropriate information and a realistic next step.",
      difficulty: "beginner",
    },
    {
      id: "question-content-purpose",
      topicId: "customer-journey",
      skillId: "skill-customer-journey",
      type: "multiple-select",
      prompt: "Which two elements give a content asset a clear purpose?",
      context: "Select two answers.",
      options: [
        { id: "a", text: "One primary audience need", isCorrect: true },
        { id: "b", text: "One desired audience action", isCorrect: true },
        { id: "c", text: "The maximum possible word count", isCorrect: false },
        { id: "d", text: "A presence on every available channel", isCorrect: false },
      ],
      explanation: "Purposeful content connects one primary audience need with one intended action.",
      difficulty: "intermediate",
    },
    {
      id: "question-channel-scenario",
      topicId: "channel-strategy",
      skillId: "skill-channel-strategy",
      type: "multiple-choice",
      prompt: "A local business wants nearby customers to book a service this week. Which channel decision is strongest?",
      context: "Choose the option that best connects objective, audience, and action.",
      options: [
        { id: "a", text: "Use a locally targeted search campaign with a booking action", isCorrect: true },
        { id: "b", text: "Post an unrelated trend on every social platform", isCorrect: false },
        { id: "c", text: "Run a broad awareness campaign with no location targeting", isCorrect: false },
        { id: "d", text: "Choose the channel with the most ad formats", isCorrect: false },
      ],
      explanation: "The targeted search option aligns local intent, the booking objective, and a measurable action.",
      difficulty: "intermediate",
    },
    {
      id: "question-channel-factors",
      topicId: "channel-strategy",
      skillId: "skill-channel-strategy",
      type: "multiple-select",
      prompt: "Which factors should directly guide channel selection?",
      context: "Select all that apply.",
      options: [
        { id: "a", text: "Campaign objective", isCorrect: true },
        { id: "b", text: "Audience behavior", isCorrect: true },
        { id: "c", text: "The team’s favorite platform", isCorrect: false },
        { id: "d", text: "Measurement quality", isCorrect: true },
      ],
      explanation: "Relevant channels support the intended objective, fit audience behavior, and provide a useful measurement signal.",
      difficulty: "intermediate",
    },
    {
      id: "question-metric-objective",
      topicId: "campaign-measurement",
      skillId: "skill-campaign-measurement",
      type: "multiple-choice",
      prompt: "A campaign’s goal is completed purchases. Which metric is most directly connected to that goal?",
      options: [
        { id: "a", text: "Page impressions", isCorrect: false },
        { id: "b", text: "Follower count", isCorrect: false },
        { id: "c", text: "Purchase conversion rate", isCorrect: true },
        { id: "d", text: "Number of published posts", isCorrect: false },
      ],
      explanation: "Purchase conversion rate measures the intended outcome rather than only campaign activity.",
      difficulty: "beginner",
    },
    {
      id: "question-measurement-combination",
      topicId: "campaign-measurement",
      skillId: "skill-campaign-measurement",
      type: "multiple-select",
      prompt: "Which metrics together give the clearest view of campaign quality?",
      context: "Select two answers.",
      options: [
        { id: "a", text: "Reach", isCorrect: false },
        { id: "b", text: "Qualified conversion rate", isCorrect: true },
        { id: "c", text: "Cost per acquisition", isCorrect: true },
        { id: "d", text: "Number of draft ideas", isCorrect: false },
      ],
      explanation: "Outcome quality and acquisition efficiency show whether the campaign is producing meaningful results at a sustainable cost.",
      difficulty: "advanced",
    },
  ],
};

/** Produces a balanced direct-preview result: clear strengths and two priority gaps. */
export const demoAssessmentResponses: AssessmentResponse[] = [
  { questionId: "question-funnel-awareness", selectedOptionIds: ["a"] },
  { questionId: "question-planning-start", selectedOptionIds: ["b"] },
  { questionId: "question-journey-map", selectedOptionIds: ["a"] },
  { questionId: "question-content-purpose", selectedOptionIds: ["a"] },
  { questionId: "question-channel-scenario", selectedOptionIds: ["a"] },
  { questionId: "question-channel-factors", selectedOptionIds: ["a", "c"] },
  { questionId: "question-metric-objective", selectedOptionIds: ["a"] },
  { questionId: "question-measurement-combination", selectedOptionIds: ["b", "d"] },
];

export function getPreAssessmentForCourse(courseId: string) {
  return courseId === digitalMarketingPreAssessment.courseId ? digitalMarketingPreAssessment : undefined;
}
