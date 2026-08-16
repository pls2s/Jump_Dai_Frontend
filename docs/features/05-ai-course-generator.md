# 05 — AI Course Generator

## Purpose

Transform the structured knowledge analysis into a complete, source-grounded course draft that is ready for Creator review.

## Primary user

Creator working with a simulated AI generation service.

## Requirements covered

- Generation entry summary with course, sources, topics, objectives, audience, and difficulty
- Course outline, modules, lessons, lesson objectives, exercises, quizzes, practical task, and final assessment
- Understandable staged generation progress
- Failure and retry without data loss
- Hierarchical generated-course inspection
- Source-reference inspection
- Explicit review-before-publish handoff

## Routes

- `/creator/courses/[courseId]/generate`
- `/creator/courses/[courseId]/generated`
- `/creator/courses/[courseId]/generate?state=failed` for deterministic recovery QA

## User flow

Knowledge analysis → generation readiness → Generate course → staged generation → generated course workspace → Review generated course.

## Main screens

- Generation readiness summary
- Seven-step generation processing experience
- Recoverable generation failure
- Generated course structure and selected-content detail

## Components

- `GenerationWorkspace`
- `GeneratedCourseWorkspace`
- `CourseStructureNav`
- `GeneratedContentDetail`
- Shared `SourceReferencesDrawer`

## Interactions

- Generate starts a local staged process rather than a generic spinner
- Retry restarts after a simulated failure
- Module, lesson, practical-task, and assessment selections update the detail area
- View sources opens the reusable grounding drawer
- Review generated course opens Human Verification; no Publish action exists on generation screens

## States

- Dependency check
- Ready to generate
- Generating / partial progress
- Failed / retrying
- Generated result
- Missing generated draft

## Mock behavior

The generator uses structured fixtures from `src/data/mock/generated-course.ts`. No AI/RAG API is called. The simulation creates a fresh course state after all progress stages finish.

## Persistence

Generated content is stored per course under `skillsync-generated-course:[courseId]`. The saved course includes a snapshot of current course configuration.

## Known limitations

- No real AI, generation polling, token streaming, or backend status transition
- Regenerating replaces the current local generated draft
- Generated content is available only in the current browser

## Future backend integration points

- `POST /api/courses/{course_id}/generate`
- `GET /api/courses/{course_id}/generation-status`
- `GET /api/courses/{course_id}/modules`

These endpoints are documented in `API_doc.md`, but this frontend task intentionally does not claim they are connected.
