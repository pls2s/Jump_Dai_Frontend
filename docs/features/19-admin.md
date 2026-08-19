# 19 — Admin

## Purpose

Provide limited platform-level oversight of SkillSync users, role/workspace context, course lifecycle, learning outcomes, and recent platform activity. Function 19 is intentionally not a generic SaaS, HR, billing, or infrastructure administration system.

## Primary user

System-assigned SkillSync Admin. Admin is a `UserRole`, not a selectable `WorkspaceType` or signup account type.

## Requirement-supported capabilities

The repository requirement audit names user, role, content, account, and audit-access management as the Function 19 area. In API mode, the existing Users routes use the documented backend Admin user-management contract for account listing, role replacement, and account suspension/reactivation. Course oversight and platform activity remain the existing frontend fixtures because no matching backend contracts exist.

## Routes

- `/admin` — platform overview
- `/admin/users` — searchable/filterable account overview
- `/admin/users/[userId]` — read-only user, workspace, role, and activity context
- `/admin/courses` — lifecycle-aware platform course overview
- `/admin/courses/[courseId]` — read-only ownership, activity, assessment, skill, and content outcomes
- `/admin/activity` — deterministic platform activity overview
- `/dev/frontend-preview/admin?destination=…` — bypass-only Admin preview session handoff
- `?state=empty`, `?state=loading`, and `?state=error` — development state previews

## Access rules

The Admin shell requires `session.user.roles` to contain `admin`. Creator, Learner, and Organization sessions redirect to their own workspace. A normal bypass session still defaults to Creator and cannot open Admin. The development preview index uses a dedicated bypass-only handoff that seeds a system-role preview session before opening an allow-listed `/admin` destination.

When API mode is enabled, signing in with the seed Admin account (`admin@skillsync.local` / `password123`) now opens `/admin`; the Users navigation item then opens the live management view.

Admin is absent from Create Account and Account Type. No `?role=admin` authorization exists. The Organization fixture remains `workspaceType: organization` plus `roles: [creator]`; Admin does not change that architecture.

## Admin overview

Summary metrics are derived from the current fixtures: total users, learners, creators, organizations, Admins, total courses, and Published courses. The overview also exposes current course lifecycle and recent oversight activity with working detail links.

## User oversight

Users can be searched by name/email and filtered by Learner, Creator, Organization, or Admin. In API mode these filters run locally over the backend's Admin account list. User detail shows only backend account identity, workspace, email verification, onboarding, role, and active/suspended status; the list endpoint is used to locate the selected account because there is no per-user GET endpoint.

An Admin can replace another account’s `LEARNER`, `CREATOR`, and/or `ADMIN` roles, with at least one role required, and suspend or reactivate it. The UI protects the current Admin account from removing its own `ADMIN` role or suspending itself, avoiding accidental loss of access. It does not expose deletion, impersonation, password reset, or unrelated personal data.

## Course oversight

Courses reuse `CourseLifecycleStatus`, the Creator course catalog, Organization owner associations, and Function 17 analytics. Admin may inspect ownership and existing Draft, Review, Published, or Unpublished lifecycle state. Published courses expose learner progression, assessment, skill, and content outcomes. Admin cannot edit Creator content or change lifecycle.

The Courses view can export the active lifecycle filter as a small client-side CSV through the shared Function 20 export utility. It does not request or imply a server report.

## Platform activity

The activity page contains deterministic account, course, and organization events with a working type filter. It is explicitly a lightweight oversight feed, not a tamper-resistant security audit log.

## States

- Loading Admin data
- Unable to load Admin data with Retry
- No platform records
- No users/courses/activity
- No results for active filters/search
- Unknown user and course recovery
- Non-published course explanation
- Published course with no learner activity
- Ready overview, users, courses, detail, and activity

## Mock behavior and persistence

`src/data/mock/admin.ts` contains only the additional oversight account/activity fixtures. Courses, analytics, Organization identity/ownership, lifecycle, and roles reuse the existing sources. Admin metrics and filters are derived outside JSX. The explicit Admin preview session reuses the existing auth-session storage and is cleared by Sign out; Function 19 adds no competing localStorage subsystem.

## Security limitations

Frontend guards hide Admin content from ordinary frontend sessions but are not backend authorization. The mock backend returns the `ADMIN` role during sign-in and enforces that role on every `/api/users` management request. Production still requires server-side authorization, audit logging, privacy rules, and persistent data.

## API limitations

The live API-mode user management contract is:

- `GET /api/users` — list accounts; requires an `ADMIN` token
- `PUT /api/users/{user_id}/roles` — replace roles with a non-empty `LEARNER`/`CREATOR`/`ADMIN` list
- `PATCH /api/users/{user_id}/status` — set `is_active`; suspending invalidates that user’s mock tokens

No `/api/admin/*` endpoint is guessed. The backend does not currently expose Admin course oversight, activity/audit events, per-user retrieval, pagination, or server-side search/filtering.

## Known limitations

- Admin Users is live only when signed in through API mode as `admin@skillsync.local`; the other Admin pages remain deterministic frontend fixtures
- The mock backend resets user changes when its server process restarts or reloads
- No per-user GET, pagination, server-side search/filtering, privacy policy, real-time updates, server-authoritative export, or audit log
- Course/content oversight and platform activity are not backend-admin APIs yet
- Function 20 notifications and CSV export remain deterministic browser behavior

## Future backend integration

Backend owners should next document per-user retrieval, pagination/filter semantics, course oversight resources, privacy rules, audit-event guarantees, and errors. The existing UI and route boundary can consume those contracts without adding guessed endpoints.
