# 07 — Course Preview & Publishing

## Purpose

Let a Creator publish a verified, source-grounded learning path to the public Backend catalog.

## Routes

- `/creator/courses/[courseId]/preview`
- `/creator/courses/[courseId]/published`

## API integration

For numeric Creator course IDs in API mode, publication uses:

- `GET /api/courses/{course_id}/learning-path` to show the reviewable generated content
- `GET /api/courses/{course_id}/generation-status` to confirm the `VERIFIED` prerequisite
- `POST /api/courses/{course_id}/publish` to publish the verified course
- `GET /api/catalog/courses/{course_id}` to render the public catalog result

The publish action is disabled until the Backend status is `VERIFIED`; the Backend independently enforces the same requirement. After publication, the Published screen reads the public catalog rather than local browser state.

## States

- Loading or missing learning path
- Verification required
- Verified and ready to publish
- Publish confirmation
- Publishing or recoverable Backend error
- Published catalog result
- Already published

## Current limitations

- The Backend public catalog exposes a course detail API, not a dedicated learner-facing Next.js route or enrollment flow.
- There is no Backend unpublish endpoint, so API-mode pages intentionally do not show an unpublish control.
- The Backend learning-path contract currently contains overview, modules, lessons, and citations; it does not contain the richer demo-only exercise/quiz/practical preview content.

## Demo behavior

Slug-based demo and bypass routes retain the existing browser-only preview, readiness checklist, publish simulation, and unpublish flow.
