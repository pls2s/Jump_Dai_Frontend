# 13 — Quiz / Post-Assessment

## Purpose

Provide short learning checks and measure the same competencies after learning so improvement can be compared with Pre-Assessment.

## Primary user

Learner.

## Routes and flow

- Quick quiz: `/learner/courses/[courseId]/quiz/[quizId]`
- Post-Assessment: `/learner/courses/[courseId]/post-assessment`
- Bypass previews: `?view=question`, `?view=submitting`, `?view=analyzing`, and `?view=result&result=passed|needs-practice`
- Lesson → quick quiz → learning; completed learning → Post-Assessment → Practical Assessment when passed

## Components and data model

`KnowledgeCheckWorkspace` reuses typed assessment questions and answer controls. `KnowledgeCheckDefinition`, `KnowledgeCheckAttempt`, and `KnowledgeCheckResult` remain separate from Pre-Assessment results.

## States and validation

Not started, in progress, submitting, evaluating, submitted, passed, and needs more practice. Each question requires an answer. MCQ and multi-select are supported; correct answers appear only after submission. Post-Assessment submission uses saved submission and staged comparison/criteria analysis states instead of jumping immediately to its result.

## Mock logic and persistence

The centralized knowledge-check engine calculates question, skill, exact-correct count, and total scores outside JSX. Quick checks pass at 60%; Post-Assessment passes at 70%. Attempts, evaluating state, answers, and results persist in the shared learner-journey record.

## Completion rules

Post-Assessment requires all personalized lessons complete. Practical Assessment requires a passing Post-Assessment. A submitted failing score never satisfies course completion.

## API mode

For a numeric backend course ID, the existing Post-Assessment route enrolls the learner, reads `GET /api/courses/{course_id}/assessments`, and submits `POST /api/assessments/{assessment_id}/submit`. The learner must finish all backend lessons first; Function 12 does not yet expose its lesson UI, so lessons can currently be completed through Swagger before opening this page.

The backend contract provides assessment topics and stores one learner-entered score per topic. It does not return questions, answers, timer controls, attempts limits, or server-side grading. API mode therefore does not present frontend mock questions as backend questions.

## Known limitations

Quick lesson quizzes have no matching backend endpoint. A Creator must create or generate the course's `POST_ASSESSMENT` definition first. Mock backend data resets when the backend server reloads.
