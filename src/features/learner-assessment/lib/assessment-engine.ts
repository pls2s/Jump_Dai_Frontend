import { assessmentSkills } from "@/data/mock/pre-assessment";
import type { AssessmentQuestion, AssessmentResponse, PreAssessmentAttempt, PreAssessmentDefinition, PreAssessmentResult } from "@/features/learner-journey/types";
import { skillStatusFor, WEAK_SKILL_THRESHOLD } from "./assessment-config";

function answerSet(ids: string[]) {
  return new Set(ids);
}

export function scoreQuestion(question: AssessmentQuestion, response?: AssessmentResponse) {
  const selected = answerSet(response?.selectedOptionIds ?? []);
  const correct = answerSet(question.options.filter((option) => option.isCorrect).map((option) => option.id));
  const isCorrect = selected.size === correct.size && [...selected].every((id) => correct.has(id));
  if (question.type === "multiple-choice") return { score: isCorrect ? 100 : 0, isCorrect };
  const matchedOptions = question.options.filter((option) => selected.has(option.id) === option.isCorrect).length;
  return { score: Math.round((matchedOptions / question.options.length) * 100), isCorrect };
}

export function calculateAssessmentResult(definition: PreAssessmentDefinition, attempt: PreAssessmentAttempt): PreAssessmentResult {
  const questionScores = definition.questions.map((question) => ({
    questionId: question.id,
    ...scoreQuestion(question, attempt.responses.find((response) => response.questionId === question.id)),
  }));
  const skillScores = assessmentSkills.map((skill) => {
    const skillQuestions = definition.questions.filter((question) => question.skillId === skill.id);
    const scores = skillQuestions.map((question) => questionScores.find((score) => score.questionId === question.id)?.score ?? 0);
    const score = Math.round(scores.reduce((total, value) => total + value, 0) / Math.max(scores.length, 1));
    return { skillId: skill.id, topicId: skill.topicId, name: skill.name, score, status: skillStatusFor(score).status, questionCount: skillQuestions.length };
  });
  const overallScore = Math.round(questionScores.reduce((total, item) => total + item.score, 0) / Math.max(questionScores.length, 1));
  return {
    assessmentId: definition.id,
    attemptId: attempt.id,
    overallScore,
    skillScores,
    questionScores,
    prioritySkillIds: skillScores.filter((skill) => skill.score < WEAK_SKILL_THRESHOLD).sort((a, b) => a.score - b.score).map((skill) => skill.skillId),
    strengthSkillIds: skillScores.filter((skill) => skill.score >= 80).sort((a, b) => b.score - a.score).map((skill) => skill.skillId),
    completedAt: new Date().toISOString(),
  };
}
