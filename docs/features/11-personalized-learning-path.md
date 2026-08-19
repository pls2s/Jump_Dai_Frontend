# 11 — Personalized / Adaptive Learning Path

## Purpose

Generate and show a learner-specific lesson order based on saved preferences and the latest pre-assessment.

## Route

- `/learner/courses/[courseId]/learning-path`
- Generate: `/learner/courses/[courseId]/learning-path?view=generating`

## API integration

API learner sessions use:

- `POST /api/learning/paths` — create a personalized path from the latest profile and assessment
- `GET /api/learning/paths/current` — load the latest path without regenerating it

The page renders only API-returned fields: learning goal, target role, learning styles, overall level, weak topics, lesson order, time estimates, reasons, and study recommendations. The backend’s `version` and `is_adaptive` status are displayed accurately.

## States

- Loading current path
- Generating from the backend
- Missing profile/assessment/path guidance
- Request failure with a safe return to skill gap
- Ready path

## Demo behavior

Demo/bypass sessions retain the existing deterministic local path generator and staged preview states. API sessions never use demo lessons or demo progress as a fallback.

## Known limitation

Function 12 lesson delivery/progress has an existing frontend, but it is not connected to this personalized-path API yet. The ready state therefore returns the learner home instead of entering a mock lesson as if the API path had persisted lesson progress.
