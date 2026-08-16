# 09 — Pre-Assessment

## Purpose

Measure course-relevant knowledge before a personalized path is created. Self-rated familiarity from Function 08 remains context and never substitutes for assessment evidence.

## Primary user

Learner.

## Routes

- `/learner/courses/[courseId]/pre-assessment`
- Bypass previews: `?view=intro`, `?view=question`, and `?view=processing`

## User flow

Learning preferences → intro → one question at a time → answer review → submit confirmation → staged evaluation → Skill Gap.

## Main components

- `PreAssessmentWorkspace`
- shared `Progress`, `Badge`, `Card`, `Button`, and `ConfirmationDialog`
- typed question fixtures and an assessment engine outside JSX

## Data model

`PreAssessmentDefinition`, `AssessmentQuestion`, `AssessmentResponse`, `PreAssessmentAttempt`, and `PreAssessmentResult`. Eight questions cover four competencies and support multiple-choice and multiple-select answers.

## Validation

The current question needs at least one answer before Next. Submission stays disabled until all eight questions are answered. Errors are associated with the answer fieldset.

## States

Intro, in progress, resumed, answer review, evaluating, completed, missing learning profile, and unknown course.

## Mock logic and persistence

Answers, position, attempt status, and result persist in one `skillsync-learner-journey:{learnerId}:{courseId}` localStorage record. Evaluation uses deterministic typed fixtures and a configurable scoring utility. Correct answers remain hidden until submission.

## Dependencies

Requires a valid learner course and completed Function 08 profile. Completion supplies the evidence required by Functions 10 and 11.

## Known limitations

No timer, randomized question bank, server attempt authority, proctoring, or backend grading. Bypass mode may hydrate reusable preview fixtures.

## Future backend/API integration

`API_doc.md` documents general assessment endpoints and conceptual pre-test paths, but the pre-test request/response schemas are incomplete. Do not integrate until the contract defines attempt, answer, scoring, and result payloads.
