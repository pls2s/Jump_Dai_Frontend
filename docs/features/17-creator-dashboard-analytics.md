# 17 — Creator Dashboard & Analytics

## Purpose

Help a Creator understand published-course participation, completion, assessment improvement, applied skill outcomes, and content that may need attention.

## Primary user

Creator.

## Routes

- `/creator` — Creator overview
- `/creator/courses` — lifecycle-aware course actions
- `/creator/analytics` — all-course analytics and filters
- `/creator/analytics/[courseId]` — published-course detail
- `/creator/analytics?state=empty` — no published courses
- `/creator/analytics?state=loading` — persistent loading preview
- `/creator/analytics?state=error` — recoverable error preview
- `/creator/analytics/ai-productivity-basics` — published course with no learner activity

## User flow

Creator workspace → Published course → View analytics → change time range/course → inspect funnel, assessment, skills, and content → export current course metrics.

Draft, Review, and Unpublished courses do not display learner performance as though they were Published. A published course with no activity receives a dedicated waiting state rather than zero-filled charts.

## Metrics

- Total and Published courses
- Active learners
- Course starts and completions
- Completion rate derived from completions / starts
- Average Post-Assessment score
- Verified skills
- Course lifecycle counts using `draft`, `review`, `published`, and `unpublished`

## Filters

- Course: all Published courses or one Published course
- Time range: 7, 30, 90 days, or all time

Filters are encoded in URL search parameters. The deterministic range engine rescales learner counts and adjusts score fixtures consistently, then re-derives completion rates and aggregate metrics.

## Course analytics

Published-course comparison includes learner starts, completion, average assessment, practical pass rate, and Verified skills. Course detail uses the same data and components rather than a separate model.

## Assessment analytics

Shows Pre-Assessment average, Post-Assessment average, average improvement, and Practical Assessment pass rate. These fields follow the concepts and thresholds already exposed in Learner Functions 09–15.

## Skill analytics

Each skill shows Pre/Post scores and improvement. A deterministic attention rule selects skills with a Post-Assessment score below 70%, Practical pass rate below 60%, or retry rate of at least 20%. The UI explains the relevant observed challenge without presenting hidden AI reasoning.

## Content analytics

Lesson, Practice, and Quiz rows show completion, quiz performance where available, and retry rate. The prototype intentionally omits heatmaps and session-level surveillance.

## States

- Loading analytics
- Analytics unavailable with Retry
- No Published courses
- Published course with no learner activity
- Non-published course
- Unknown analytics course
- Analytics ready
- CSV export success

## Mock data

`src/data/mock/creator-analytics.ts` contains coherent course, funnel, assessment, skill, and content fixtures. `Digital Marketing Foundations` has meaningful learner activity; `AI Productivity Basics` is Published with no activity; the catalog also contains Draft, Review, and Unpublished examples.

Metric derivation lives outside JSX in `analytics-engine.ts`. Runtime loading lives in `creator-analytics-service.ts`.

## Export behavior

Export CSV creates a browser download containing the courses and metrics visible under the active filters. It calls no backend and reports success through the shared toast system.

## Persistence

Course lifecycle continues to use the existing generated-course local state. Analytics filters use URL search parameters so refresh and sharing preserve the selected view. Analytics fixtures themselves are deterministic and are not stored as a competing localStorage model.

## Known limitations

- No backend analytics/event endpoint is documented in `API_doc.md`
- No real enrollments, event stream, aggregation, privacy controls, or real-time refresh
- CSV is generated client-side from demo fixtures
- Insights are deterministic observations, not AI-generated recommendations
- Course analytics are course-scoped; no organization-wide reporting is implemented

## Future backend/API integration

Backend owners must document analytics endpoints, event definitions, time-range semantics, authorization, aggregation, error schemas, and export behavior before API mode can replace the frontend service. The current UI sends no guessed analytics request.
