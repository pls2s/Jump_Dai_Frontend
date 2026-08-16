# 02 — Create Course

## Purpose

Guide creators through a focused course configuration process without presenting one large form.

## User goal

Define the course basics, intended learners, outcomes, and completion certificate, review the setup, and continue directly to source collection.

## Routes

- `/creator/courses/new/basics`
- `/creator/courses/new/audience`
- `/creator/courses/new/objectives`
- `/creator/courses/new/certificate`
- `/creator/courses/new/review`

## Main screens

- Course basics: name and description
- Audience & level: target learner and accessible difficulty choices
- Learning objectives: add, edit, and remove multiple outcomes
- Certificate: certificate toggle and simple completion criteria
- Review: summarized sections with edit links and source-upload handoff

## Components

- `CourseWizard` renders all routed steps with consistent navigation
- `CourseSetupProvider` owns shared wizard state
- Shared `Stepper`, `Card`, `Input`, `Textarea`, `Radio`, `Toggle`, `Badge`, and buttons

## Interactions

- Back and Continue follow the ordered route flow
- Save & exit returns to the Creator home
- Review Edit links return to the matching step
- Add objective appends an editable outcome; remove is disabled when only one remains
- Final review calls a mode-aware course service
- Demo mode returns the seeded course slug and opens its local source workspace without a backend request
- API mode calls authenticated `POST /api/courses` and opens `/creator/courses/{returnedId}/sources`
- The API request sends only documented fields: `title`, `description`, and `goal`

## States

- Current, completed, and remaining step states
- Step-specific validation for course basics, target learner, and every objective
- Disabled Continue with a visible explanation of the missing requirement
- Conditional certificate criteria
- Device-local saved values across navigation and reloads

## Mock behavior

The wizard begins with realistic Digital Marketing Foundations content. In-progress values are saved locally. Demo mode simulates submission and continues to the slug-based mock workspace. In API mode, course name maps to `title`, description maps directly, and learning objectives are combined into the documented string `goal`.

## Known limitations

- Target learner, difficulty, objective arrays, and certificate settings are not included in the backend request because the documented course schema has no matching fields
- No backend draft autosave, collaborative editing, or server validation details beyond the general error envelope
- Objective reordering is not implemented and no drag affordance is shown
- Creator Home remains seeded; `/creator/courses` lists local fixtures in demo mode and backend-returned courses in API mode
