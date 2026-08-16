import { PRACTICAL_ASSESSMENT_PASSING_SCORE, practicalAssessmentDefinition } from "@/data/mock/learning-experience";
import type { PracticalAssessmentState, PracticalDraft, PracticalRubricScore } from "@/features/learner-journey/types";

function scoreByLength(value: string, possible: number, strongLength: number) {
  const ratio = Math.min(value.trim().length / strongLength, 1);
  return Math.round(possible * (0.48 + ratio * 0.44));
}

export function evaluatePracticalDraft(state: PracticalAssessmentState): PracticalAssessmentState {
  const draft = state.draft;
  const scores: PracticalRubricScore[] = [
    { criterionId: "objective", label: "Campaign objective", possible: 25, earned: scoreByLength(draft.objective, 25, 65), feedback: "Make the intended outcome specific and measurable." },
    { criterionId: "audience", label: "Audience alignment", possible: 20, earned: scoreByLength(draft.targetAudience, 20, 70), feedback: "Connect the audience description to a concrete need or behavior." },
    { criterionId: "channel", label: "Channel rationale", possible: 25, earned: scoreByLength(`${draft.channelSelection} ${draft.coreMessage}`, 25, 125), feedback: "Explain how each channel and message supports the audience action." },
    { criterionId: "measurement", label: "Measurement plan", possible: 30, earned: scoreByLength(draft.measurementMetrics, 30, 95), feedback: "Include both an outcome metric and an efficiency or quality measure." },
  ];
  const totalScore = scores.reduce((total, score) => total + score.earned, 0);
  const passed = totalScore >= PRACTICAL_ASSESSMENT_PASSING_SCORE;
  return {
    ...state,
    status: passed ? "passed" : "needs-more-practice",
    evaluatedAt: new Date().toISOString(),
    rubricScores: scores,
    totalScore,
    evidenceSummary: "Created a campaign plan with an objective, audience, channel strategy, core message, and measurement framework.",
  };
}

export function practicalDraftErrors(draft: PracticalDraft) {
  const entries = Object.entries(draft) as Array<[keyof PracticalDraft, string]>;
  return Object.fromEntries(entries.filter(([, value]) => value.trim().length < 5).map(([key]) => [key, "Add enough detail for this part of your plan."])) as Partial<Record<keyof PracticalDraft, string>>;
}

export function newPracticalAssessment(draft: PracticalDraft): PracticalAssessmentState {
  return { id: practicalAssessmentDefinition.id, status: "draft", draft };
}
