# 05 — AI Course Generator

## Purpose

Turn processed, trusted knowledge into a source-grounded learning-path draft with Typhoon AI.

## Primary user

Creator generating a reviewable course draft from the configured Typhoon provider.

## Routes

- `/creator/courses/[courseId]/generate`
- `/creator/courses/[courseId]/generated`

## API integration

For numeric Creator course IDs in API mode, the generator uses these authenticated Backend endpoints:

- `GET /api/courses/{course_id}` to load the course context
- `GET /api/courses/{course_id}/knowledge-sources` to confirm processed sources and chunk count
- `GET /api/courses/{course_id}/generation-status` to detect a stored draft or previous failure
- `POST /api/courses/{course_id}/generate` to call Typhoon
- `GET /api/courses/{course_id}/learning-path` to render the persisted result

The generated screen renders exactly the source-grounded response supplied by the Backend: overview, modules, learning objectives, lesson summaries, and cited chunk IDs. Slug-based demo and bypass routes retain the existing local simulation.

## States

- Checking source and generation readiness
- Ready to generate
- Waiting for the synchronous Typhoon Backend response
- Recoverable Backend failure and retry
- Existing generated draft
- Generated learning-path result
- Missing draft

## Persistence

API-generated drafts are persisted by the Backend and reload from the learning-path endpoint. Demo-generated content remains local under `skillsync-generated-course:[courseId]`.

## Known limitations

- Generation is synchronous in the current MVP, so the API UI does not invent progress percentages or streaming events.
- Backend output does not yet include exercises, quizzes, practical tasks, final assessments, or source-chunk excerpts.
- Creator Review editing and verification are separate endpoints and are the next frontend integration.

## Next API connections

- `PUT /api/courses/{course_id}/learning-path`
- `POST /api/courses/{course_id}/verify`
- `POST /api/courses/{course_id}/publish`
