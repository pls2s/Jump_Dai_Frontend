# 19 — Admin

## Purpose

Provide limited platform-level oversight of SkillSync users, role/workspace context, course lifecycle, learning outcomes, and recent platform activity. Function 19 is intentionally not a generic SaaS, HR, billing, or infrastructure administration system.

## Primary user

System-assigned SkillSync Admin. Admin is a `UserRole`, not a selectable `WorkspaceType` or signup account type.

## Requirement-supported capabilities

The repository requirement audit names user, role, content, account, and audit-access management as the Function 19 area. The current frontend implements the safe, contract-independent oversight portion: read-only users/accounts/roles/workspaces, course/content lifecycle and outcomes, and lightweight recent activity. It does not add unsupported deletion, impersonation, password reset, arbitrary role assignment, or course editing.

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

Admin is absent from Create Account and Account Type. No `?role=admin` authorization exists. The Organization fixture remains `workspaceType: organization` plus `roles: [creator]`; Admin does not change that architecture.

## Admin overview

Summary metrics are derived from the current fixtures: total users, learners, creators, organizations, Admins, total courses, and Published courses. The overview also exposes current course lifecycle and recent oversight activity with working detail links.

## User oversight

Users can be searched by name/email and filtered by Learner, Creator, Organization, or Admin. User detail shows only the existing account identity, workspace, roles, joining label, and SkillSync activity summary. It exposes no password, secret, HR, payroll, employment, or unrelated personal data.

The current requirements/API do not define safe mutation contracts, so Function 19 does not pretend to disable/delete accounts, reset passwords, impersonate users, or assign roles.

## Course oversight

Courses reuse `CourseLifecycleStatus`, the Creator course catalog, Organization owner associations, and Function 17 analytics. Admin may inspect ownership and existing Draft, Review, Published, or Unpublished lifecycle state. Published courses expose learner progression, assessment, skill, and content outcomes. Admin cannot edit Creator content or change lifecycle.

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

Frontend guards hide Admin content from ordinary frontend sessions but are not backend authorization. Production security requires server-issued Admin role data and server-side authorization on every Admin request. The current API login response does not expose role/workspace authorization data to make a normal API-mode Admin session possible.

## API limitations

`API_doc.md` names `ADMIN` as a role and assigns Permission to the backend, but documents no Admin dashboard, user list/detail, role, account status, course oversight, or audit/activity endpoint. Function 19 sends no guessed `/api/admin/*` request.

## Known limitations

- Deterministic frontend fixtures, not live platform data
- Read-only oversight; no account/content mutation
- Small fictional roster rather than a production directory
- Lightweight recent activity rather than a security audit log
- No backend authorization, pagination, privacy policy, real-time updates, or export
- No Function 20 notification center or reporting service

## Future backend integration

Backend owners must document Admin authentication/authorization, role/workspace claims, user/course oversight resources, permitted mutations, pagination/filter semantics, privacy rules, audit-event guarantees, and errors before the frontend service can switch from fixtures. The UI and route boundary can consume those contracts without adding guessed endpoints.
