# 11 — Personalized / Adaptive Learning Path

## Purpose

Create a visibly personalized course sequence from assessment evidence, learner goal, content preferences, and pace.

## Primary user

Learner.

## Routes

- `/learner/courses/[courseId]/learning-path`
- Bypass states: `?view=generating`, `?view=result`, and `?state=failed`
- Function 12 entry: `/learner/courses/[courseId]/learn`

## User flow

Skill Gap → staged path generation → path result → intentional Learning Experience destination.

## Main components

- `LearningPathWorkspace`
- pure `createPersonalizedLearningPath` generator
- shared progress, status, card, and action components

## Data model

`PersonalizedLearningPath` records `pathVersion`, `generatedAt`, `sourceAssessmentId`, status, pace, preferences used, estimates, and ordered items. Items carry Priority, Recommended, or Quick refresher emphasis plus reason, time, activities, and skill addressed.

## Personalization logic

Skills below 60% come first with more lesson/practice/quiz activity. Proficient areas receive recommended reinforcement. Scores of 80% or more retain required concepts as concise refreshers rather than being silently skipped. Function 08 preferences add matching activity formats; pace adjusts presentation time without skipping competency content.

## Validation and states

Normal mode blocks generation without a complete learning profile and completed assessment. States include loading, missing dependency, generating, ready, failure, and retry.

## Mock behavior and persistence

Generation uses short staged timers and a deterministic local catalog. The generated path persists in the shared learner-journey record with evidence/version metadata. New assessment results clear the old path.

## Dependencies

Requires Functions 08–10. Function 12 now consumes the saved path while Function 11 remains responsible only for path generation and ordering.

## Known limitations

No backend generator, live adaptation, lesson completion, enrollment rules, prerequisite resolver, or server time estimate.

## Future backend/API integration

`API_doc.md` has a generic course learning-path read endpoint and states that the backend should determine order. A personalized generation/result schema is not yet documented; preserve this frontend boundary until it is.
