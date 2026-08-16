import { assessmentSkills } from "@/data/mock/pre-assessment";
import type { KnowledgeCheckAttempt, KnowledgeCheckDefinition, KnowledgeCheckResult } from "@/features/learner-journey/types";
import { scoreQuestion } from "./assessment-engine";
import { skillStatusFor } from "./assessment-config";

export function calculateKnowledgeCheckResult(
  definition: KnowledgeCheckDefinition,
  attempt: KnowledgeCheckAttempt,
): KnowledgeCheckResult {
  const questionScores = definition.questions.map((question) => ({
    questionId: question.id,
    ...scoreQuestion(question, attempt.responses.find((response) => response.questionId === question.id)),
  }));
  const skillScores = assessmentSkills
    .map((skill) => {
      const questions = definition.questions.filter((question) => question.skillId === skill.id);
      if (!questions.length) return null;
      const score = Math.round(questions.reduce((total, question) => total + (questionScores.find((item) => item.questionId === question.id)?.score ?? 0), 0) / questions.length);
      return { skillId: skill.id, topicId: skill.topicId, name: skill.name, score, status: skillStatusFor(score).status, questionCount: questions.length };
    })
    .filter((score): score is NonNullable<typeof score> => score !== null);
  const score = Math.round(questionScores.reduce((total, item) => total + item.score, 0) / Math.max(questionScores.length, 1));
  return { definitionId: definition.id, score, passed: score >= definition.passingScore, skillScores, questionScores, submittedAt: new Date().toISOString() };
}
