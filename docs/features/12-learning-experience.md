# 12 — Learning Experience

## Purpose

Deliver the saved personalized path as readable lessons while preserving position and completion progress.

## Primary user

Learner.

## Routes and flow

- Resume: `/learner/courses/[courseId]/learn`
- Lesson: `/learner/courses/[courseId]/learn/[lessonId]`
- Personalized Path → lesson → Mark complete → quick check or next lesson → Post-Assessment

## Components and data model

`LearningWorkspace` uses typed `LearnerLesson` and `LearningProgress` records. `buildPersonalizedLessonSequence` maps the path’s priority order onto generated course lessons and shortens strong topics to one refresher lesson.

## States and validation

Not started, in progress, completed, missing path, unavailable lesson, and loading. Unknown courses return 404. Required lesson completion is calculated from the complete personalized lesson sequence.

## Mock logic and persistence

Current lesson, start time, completed lesson IDs, and completion time persist in the shared learner-journey localStorage record. The desktop layout uses sticky compact navigation; mobile uses a collapsible path menu.

## Completion rules

Learning is complete only when every lesson retained by the personalized path is explicitly completed. Opening a lesson does not complete it.

## Known limitations and future backend integration

One mock course, no video/downloads, server progress, prerequisites, offline sync, or real enrollment. Later APIs should replace the service boundary without changing lesson UI contracts.
