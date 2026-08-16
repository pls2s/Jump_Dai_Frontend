# 06 — Creator Review / Human Verification

## Purpose

Give the Creator or subject-matter expert control over AI-generated content before any course can be published.

## Primary user

Creator / Subject Matter Expert.

## Requirements covered

- Generated course tree and selected-content workspace
- Review statuses: Not reviewed, In review, Verified, Needs changes
- Course-level review progress
- Editing for course, module, lesson, exercise, quiz, practical task, and final assessment content
- Save and Cancel behavior
- Unsaved-change confirmation for in-workspace navigation
- Source traceability
- Per-item verification persisted locally
- Verified content returns to Needs changes when edited
- Preview handoff with publish still guarded separately

## Routes

- `/creator/courses/[courseId]/review`

## User flow

Generated course → select required item → inspect sources → Edit if needed → Save → Mark as verified → repeat → Preview course.

## Main screens

- Review progress summary
- Responsive course tree
- Read/review mode
- Focused edit mode
- Review-complete success state
- Missing-generation dependency state

## Components

- `ReviewWorkspace`
- `ReviewEditor`
- Shared `CourseStructurePanel` and `CourseStructureNav`
- Shared `GeneratedContentDetail`
- Shared `SourceReferencesDrawer`
- Shared `ConfirmationDialog`

## Interactions

- Selecting an untouched item moves it to In review
- Edit opens only the selected content instead of turning the whole page into a form
- Save validates and persists edits; Cancel restores the saved content
- Editing a Verified item changes it to Needs changes after Save
- Mark as verified and Needs changes update review progress
- Unsaved edits trigger a discard confirmation before another item or route is opened through review controls
- Preview remains available before completion, but Publish readiness remains false
- The current module expands automatically; other modules can be independently collapsed or expanded
- Desktop structure navigation is compact, sticky, viewport-bounded, and internally scrollable; mobile uses a dismissible drawer
- Long module and lesson titles wrap to two lines and retain their full value through the native title affordance

## States

- Not reviewed
- In review
- Verified
- Needs changes
- Editing / dirty
- Saving
- Review incomplete
- Review complete
- Missing generated course

## Mock behavior

Review and verification are entirely local. Correct quiz answers are shown because this is a Creator workspace, not learner assessment delivery.

## Persistence

Edits and per-item review statuses update the same per-course generated-state record in localStorage.

## Known limitations

- No collaboration, reviewer assignment, comment history, version history, or server audit trail
- Sidebar/AppShell navigation outside the review workspace does not use the unsaved-change dialog; Save or Cancel before leaving
- Verification is a frontend prototype state, not backend approval

## Future backend integration points

- `GET /api/courses/{course_id}/modules`
- `PUT /api/modules/{module_id}`
- `PUT /api/lessons/{lesson_id}`
- `POST /api/courses/{course_id}/verify`

The current API contract does not yet describe exercise, quiz, practical-task, final-assessment editing, per-item verification, or review-progress schemas.
