# 06 — Creator Review / Human Verification

## Purpose

Let a Creator inspect, edit, and formally verify the source-grounded Typhoon learning path before publication.

## Route

- `/creator/courses/[courseId]/review`

## API integration

For numeric Creator course IDs in API mode, this workspace uses:

- `GET /api/courses/{course_id}/learning-path` to load the persisted Typhoon draft
- `GET /api/courses/{course_id}/generation-status` to read review status and verification time
- `PUT /api/courses/{course_id}/learning-path` to save Creator edits
- `POST /api/courses/{course_id}/verify` to verify the complete draft

The edit form supports the fields the Backend contract currently owns: learning-path overview, module titles/descriptions/objectives, and lesson titles/summaries. Source-chunk citations are displayed as locked values and are preserved on save so the Backend can validate source grounding.

## States

- Loading or missing generated draft
- Awaiting verification
- Editing with unsaved changes
- Saving to the Backend
- Save or source-grounding validation failure
- Verification confirmation
- Verified and ready for publication

## Persistence

API course edits and verification status persist in the Backend. Demo and bypass routes preserve the existing local per-item review prototype.

## Known limitations

- Backend review is course-level, not per-item; it has no comments, reviewers, assignment, audit history, or review-progress schema.
- Source chunk IDs are immutable in the current form. Re-generating is the safe way to create a different source-grounded structure.
- Exercises, quizzes, practical tasks, and final assessments are not part of the current Typhoon learning-path response.

## Next API connection

- `POST /api/courses/{course_id}/publish`
