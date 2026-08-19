# 18 — Organization

## Purpose

Give an Organization workspace user a learning-focused view of associated courses, learner participation, progress, assessment outcomes, and aggregate skill development.

## Primary user

Organization workspace user. The current seeded account deliberately remains `workspaceType: organization` with `roles: [creator]`; Function 18 authorizes the workspace from `workspaceType` and does not invent an Organization backend role.

## Routes

- `/organization` — overview
- `/organization/courses` — lifecycle-aware course catalog and filters
- `/organization/courses/[courseId]` — shared course performance detail
- `/organization/learners` — learning-only learner overview and filters
- `/organization/learners/[learnerId]` — learner progress and verified-skill detail
- `/organization/skills` — aggregate skill outcomes and filters
- `/organization/onboarding` — legacy redirect to `/organization`
- `?state=empty`, `?state=loading`, and `?state=error` — direct frontend-mock previews where relevant

## Workspace model

The dedicated Organization shell exposes only Overview, Courses, Learners, and Skills & Outcomes. It does not expose Creator editing routes or Admin navigation. Demo sessions require `workspaceType: organization`; Learner/Creator demo sessions redirect to their own workspace. Frontend bypass permits direct development inspection as intended.

The overview also provides a real Sign out action that clears the existing shared auth session and returns to `/sign-in`.

## Organization overview

The Overview derives Active Courses, Active Learners, Completion Rate, Verified Skills, course activity, recent learning activity, and skill development from the organization snapshot. The header shows the Organization name, learning focus, and current session user without exposing development copy in normal UI.

## Courses

Organization courses reuse `CourseLifecycleStatus` and the shared Function 17 `CourseAnalytics` model. Status and time-range filters update the URL and visible metrics. Published courses expose organization-scoped performance; Draft, Review, and Unpublished courses explicitly explain that analytics begin after publishing and offer no Creator edit/publish control.

## Learners

The fictional demo roster contains only learning-relevant fields: name, current learning, progress, completed-course count, verified skills, and recent learning activity. Course and learning-status filters work. Learner detail intentionally omits salary, attendance, appraisal, job history, and other HR data.

## Skill outcomes

The Skills view aggregates learner count, Pre/Post score, improvement, practical pass rate, and retry rate. Coverage uses the Function 17 attention rule: low Post-Assessment performance, low Practical pass rate, or high retry rate can produce Needs attention. Strong coverage additionally requires strong Post performance and practical evidence. Individual answers are never exposed.

## Analytics

Course detail reuses Function 17’s typed KPI, funnel, assessment, skill, and content performance components. Organization totals and course/skill filters are composed in the Function 18 service and derivation layer rather than hardcoded in pages.

The Skills & Outcomes view exports the currently filtered skill, participation, improvement, practical-pass, and retry values as a client-side CSV through the shared Function 20 export utility.

## Access rules

- Organization demo session: allowed
- Frontend bypass: direct preview allowed
- Learner or Creator demo session: redirected to its own workspace
- API session with the Organization workspace and Creator permission: allowed
- API session for another workspace or without Creator permission: backend returns `403 FORBIDDEN`
- Admin is not exposed by the Organization shell and cannot be self-selected; Function 19 uses a separate role-guarded workspace

## States

- Loading organization data
- Unable to load organization data with Retry
- No organization courses
- No learners
- No skill data
- No learner activity on a Published course
- Non-published course explanation
- Unknown course and unknown learner recovery
- Ready overview, courses, learners, and skills

## Mock data

Frontend mock mode uses `src/data/mock/organization.ts`. API mode receives an equivalent, isolated static fixture from `skillsync-server/app/data/mock_organization.py`; API data is mapped in `src/features/organization/api/organization-api.ts` before it reaches the existing pages.

## Persistence

The existing auth session persists Organization workspace identity. Course lifecycle remains in the existing generated-course store. Filters use URL search parameters. Function 18 adds no competing localStorage subsystem.

## API contract

All endpoints require `Authorization: Bearer <access_token>`, an Organization workspace, and the Creator role. The mock API exposes learning-only aggregate data and never includes individual answers or HR data.

- `GET /api/organization` — full snapshot used by the connected Organization pages
- `GET /api/organization/courses` and `GET /api/organization/courses/{course_id}` — course lifecycle and aggregate performance
- `GET /api/organization/learners` and `GET /api/organization/learners/{learner_id}` — learning progress and verified skills
- `GET /api/organization/skills` — aggregate skill outcome records

The connected UI reads the full snapshot through `GET /api/organization`. Course, learner, and skill endpoints are available for future focused loading without adding another frontend route. API mode intentionally ignores the frontend-only `state` preview query parameter. The existing CSV export remains client-side and exports the visible API data; there is no server-side organization export endpoint.

## Known limitations

- Current backend records are static mock data and are not persisted or recalculated from course activity
- The visible roster is a small fictional sample, not all learners represented by aggregate metrics
- Time-range controls are UI filters for the mock snapshot; the present API does not yet accept range query parameters
- No invitations, assignments, member management, privacy policy, real-time events, or server-authoritative organization report
- No Creator editing, Admin, HRM, payroll, recruitment, or employee-performance functionality

## Future backend integration

Replace the static fixture with persisted organization associations, authorization scoped to organization membership, privacy-aware aggregate queries, real time-range parameters, and server-side exports. The existing UI can consume those contracts without changing its route or component structure.
