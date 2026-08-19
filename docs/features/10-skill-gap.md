# 10 — Skill Gap

## Purpose

Show assessment scores, below-target topics, and topics that meet the learner’s current target without treating lower scores as a failure.

## Route

- `/learner/courses/[courseId]/skill-gap`
- Next: `/learner/courses/[courseId]/learning-path?view=generating`

## API integration

API learner sessions read:

- `GET /api/learning/skill-gap-analysis`

The page displays the backend assessment’s overall score, learner level, target score, and topic scores. Priority areas are the backend’s `knowledge_gaps`; topics meeting the target are transparently derived from topic scores at or above `passing_score`.

No local skill snapshot is substituted when the backend reports that a pre-assessment is missing. The learner is instead sent back to Function 09.

## Demo behavior

Demo/bypass sessions retain the prior local skill-score and answer-review experience. API sessions do not offer the local answer-review route, because individual answers are not persisted by the backend contract.

## Dependencies

Requires a completed Function 09 API pre-assessment. Its result is used by Function 11.
