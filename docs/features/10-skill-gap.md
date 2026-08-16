# 10 — Skill Gap

## Purpose

Turn pre-assessment evidence into a learner-friendly summary of current strengths, developing competencies, and priority areas.

## Primary user

Learner.

## Routes

- `/learner/courses/[courseId]/skill-gap`
- `/learner/courses/[courseId]/skill-gap/review`

## User flow

Completed assessment → skill snapshot → optional read-only answer review → Build my learning path.

## Main components

- `SkillGapWorkspace`
- `AssessmentReview`
- shared progress, badge, card, and learner-shell patterns

## Data model

Question scores aggregate into typed `SkillScore` records. Central bands are: 0–39 Needs focus, 40–59 Developing, 60–79 Proficient, and 80–100 Strong. Scores below 60% are learning-path priorities.

## Validation and states

The route requires a completed assessment result outside bypass mode. It represents loading, missing-result guidance, result, empty-priority, and empty-strength states without framing lower scores as failure.

## Mock logic and persistence

The result is calculated deterministically from saved responses and stored with the learner journey. Review shows the learner answer, expected answer, correctness text/icon, and concise explanation only after submission.

## Dependencies

Requires Function 09 completion. Its priority/strength IDs are consumed by Function 11.

## Known limitations

No normative benchmarks, weighted competency model, confidence interval, or backend result verification.

## Future backend/API integration

Replace local scoring only after assessment result and skill-level response contracts are documented. Preserve the current constructive status model in the UI.
