# 08 — Learning Goal & Learning Style

## Purpose

Collect a learner’s goal and study preferences before the pre-assessment. In API mode, the saved values are the real inputs used to generate a personalized path.

## Route

- `/learner/courses/[courseId]/learning-profile`
- Next: `/learner/courses/[courseId]/pre-assessment`

## API integration

An authenticated API learner uses:

- `GET /api/learning/profile` — restore the saved backend profile
- `PUT /api/learning/profile` — save `learning_goal`, optional `target_role`, `learning_styles`, and `weekly_learning_hours`

The UI translates its flexible content preferences into the backend’s supported styles: `VISUAL`, `AUDITORY`, `READING_WRITING`, `KINESTHETIC`, and `MIXED`. Pace becomes the weekly-hours value (quick 2, balanced 4, in-depth 6).

The UI-only familiarity and session-length fields remain required/useful form context, but the current backend contract does not persist them.

## Demo behavior

Demo/bypass sessions keep using the existing typed localStorage profile. API sessions never replace a failed backend request with demo data.

## Validation and states

- Required: primary goal, familiarity, at least one preference, and pace
- Loading saved profile, new profile, editable saved profile, inline validation, save failure, and success handoff
- A missing backend profile starts an empty form; any other API failure remains visible to the learner

## Dependencies

A Learner API session is required for API mode. Pre-assessment requires a saved profile.

## Known limitation

The personalized-profile API is learner-scoped today, not course-scoped. Its settings therefore apply to the current learner across the mock MVP.
