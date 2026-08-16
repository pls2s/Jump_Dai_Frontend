import type { SkillLevelStatus } from "@/features/learner-journey/types";

export const WEAK_SKILL_THRESHOLD = 60;

export const skillStatusBands: Array<{
  minimum: number;
  status: SkillLevelStatus;
  label: string;
}> = [
  { minimum: 80, status: "strong", label: "Strong" },
  { minimum: 60, status: "proficient", label: "Proficient" },
  { minimum: 40, status: "developing", label: "Developing" },
  { minimum: 0, status: "needs-focus", label: "Needs focus" },
];

export function skillStatusFor(score: number) {
  return skillStatusBands.find((band) => score >= band.minimum) ?? skillStatusBands[skillStatusBands.length - 1];
}

export function skillStatusLabel(status: SkillLevelStatus) {
  return skillStatusBands.find((band) => band.status === status)?.label ?? "Needs focus";
}
