# 09 — Pre-Assessment

## Purpose

Establish topic-level baseline scores before the system calculates gaps and generates a personalized path.

## Route

- `/learner/courses/[courseId]/pre-assessment`
- Next: `/learner/courses/[courseId]/skill-gap`

## API integration

The current frontend question set remains the assessment UI. When the learner submits, the frontend computes an exact-correct score for each topic and sends only those aggregate scores:

- `POST /api/learning/pre-assessments`

Request fields: `assessment_title`, `topic_scores[]`, and `passing_score` (70). The backend returns a persisted assessment with overall score and learner level.

The backend does not currently accept or retain individual answers, attempt position, partial credit, or a question bank. The UI explicitly describes this boundary and does not present unsaved answers as server data.

## Validation and states

- A saved learning profile is required (`GET /api/learning/profile`)
- Each question needs an answer before moving forward
- All questions need answers before submission
- Profile-missing guidance, loading, question, review, submit failure, and success handoff are represented

## Demo behavior

Demo/bypass sessions retain the existing local attempt, partial-credit scoring, staged evaluation, and review flow. API sessions use the backend result instead.

## Dependencies

Requires Function 08 completion. Successful submission provides the evidence for Function 10.
