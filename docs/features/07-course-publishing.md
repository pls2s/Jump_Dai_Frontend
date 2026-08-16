# 07 — Course Preview & Publishing

## Purpose

Let a Creator inspect the course from a learner perspective and publish only after all required content and verification conditions are satisfied.

## Primary user

Creator.

## Requirements covered

- Learner-style responsive preview without editing controls inside the canvas
- Expandable modules and lessons
- Objectives, activities, assessments, practical task, and certificate information
- Lifecycle states: Draft, Review, Published, Unpublished
- Reusable publish-readiness checklist
- Disabled Publish action with explicit reasons
- Publish confirmation and simulated processing
- Publish failure and retry
- Published success with view, My Courses, and copy-link actions
- Unpublish confirmation and publish-again flow
- My Courses status and action integration

## Routes

- `/creator/courses/[courseId]/preview`
- `/creator/courses/[courseId]/published`
- `/creator/courses/[courseId]/preview?state=failed` for deterministic publish-failure QA

## User flow

Creator Review → Preview → readiness check → Publish confirmation → Published success → View published course → optional Unpublish → Preview and publish again.

## Main screens

- Creator preview header and learner preview canvas
- Publish-readiness sidebar
- Publish confirmation dialog
- Publish failure/retry state
- Publish success state
- Published course management view
- Unpublished success/recovery state

## Components

- `PreviewWorkspace`
- `PublishedCourseWorkspace`
- `CoursePreviewCanvas`
- Shared `ConfirmationDialog`

## Interactions

- Native expandable module/lesson disclosure works by keyboard and touch
- Publish opens confirmation only when all readiness checks pass
- Confirmation prevents duplicate submission while Publishing
- Copy course link copies an existing Creator-access prototype route
- Unpublish preserves all course content and review state
- My Courses selects status-appropriate destinations and action labels

## States

- Not ready
- Ready
- Publishing
- Publish failed / retry
- Published
- Unpublishing
- Unpublished

## Mock behavior

Publish and Unpublish update browser state after a short delay. They do not expose a public learner route or call a backend.

## Persistence

Lifecycle, published timestamp, content, and verification remain in the per-course generated-state record. Refresh and navigation preserve them.

## Known limitations

- No real public URL, access control, learner enrollment, distribution, or backend publication
- Unpublish is frontend-only because `API_doc.md` documents Publish but no Unpublish endpoint
- Device simulator chrome and full learner progress are intentionally out of scope

## Future backend integration points

- `POST /api/courses/{course_id}/verify`
- `POST /api/courses/{course_id}/publish`
- A future documented Unpublish endpoint and public course URL contract are required before real integration
