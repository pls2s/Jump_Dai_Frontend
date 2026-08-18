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
- `?state=empty`, `?state=loading`, and `?state=error` — direct bypass previews where relevant

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

## Access rules

- Organization demo session: allowed
- Frontend bypass: direct preview allowed
- Learner or Creator demo session: redirected to its own workspace
- API session without documented Organization workspace data: redirected away; no Organization request is guessed
- Admin remains unavailable and cannot be self-selected

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

`src/data/mock/organization.ts` contains Organization identity, course-owner labels, a fictional learning-only roster, skill learner counts, and recent activity. Course and outcome metrics reuse `src/data/mock/creator-analytics.ts` so the same course does not acquire conflicting performance values.

## Persistence

The existing auth session persists Organization workspace identity. Course lifecycle remains in the existing generated-course store. Filters use URL search parameters. Function 18 adds no competing localStorage subsystem.

## API limitations

`API_doc.md` documents no Organization profile, membership, course-association, learner roster, organization analytics, permission, or export endpoint. In API mode, the Function 18 service sends no request and shows a safe contract-gap error.

## Known limitations

- Organization identity, roster, course association, and outcomes are frontend fixtures
- The visible roster is a small fictional sample, not all learners represented by aggregate metrics
- No invitations, assignments, member management, privacy policy, real-time events, or organization export
- No Creator editing, Admin, HRM, payroll, recruitment, or employee-performance functionality

## Future backend integration

Backend owners must document Organization identity, membership/authorization, course association, learner-data privacy, aggregation semantics, time ranges, and error responses before replacing the frontend service. The existing UI can consume those contracts without changing its route or component structure.
