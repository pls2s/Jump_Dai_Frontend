# 20 — Notifications / Reports / Supporting States

## Purpose

Provide a consistent supporting layer across SkillSync for timely product notifications, scoped CSV reports, loading, empty, error/retry, success, confirmation, disabled, and invalid-route states.

## Scope

Function 20 supports the completed product flows rather than introducing a separate communications or business-intelligence product. It does not include email, SMS, push infrastructure, marketing messaging, financial reports, HR reports, or background delivery services.

## Routes

- `/notifications` — role-aware notification center
- `/notifications?filter=unread` — unread notification view
- `/notifications?state=empty|loading|error` — deterministic bypass previews
- `/dev/frontend-preview/supporting-states` — bypass-only supporting-state index
- `/dev/frontend-preview/supporting-states?view=loading|empty|error|confirmation|disabled|feedback|invalid` — component state previews
- `/creator/analytics` — Creator course-performance CSV export
- `/organization/skills` — filtered Organization skill-outcome CSV export
- `/admin/courses` — filtered Admin course-oversight CSV export
- Global `not-found.tsx` — friendly invalid-route recovery

## Notifications

Notifications are typed, deterministic frontend fixtures for events already represented by Functions 05–19: generated courses, review readiness, publication, learner completion, learning-path/result readiness, credentials, Organization learning outcomes, and Admin oversight activity. The notification service resolves the current audience from the existing session role/workspace model and exposes no Admin notification to a normal account.

The center supports All and Unread filters, unread count, mark one as read, mark all as read, persisted read state, loading/error/retry, and an all-caught-up state. Opening an item marks it read and navigates only to a valid implemented destination. The shared top bar displays an accessible unread indicator only when unread items exist.

## Reports / export

One shared CSV utility handles escaping and browser download. Existing Creator Analytics export now uses it. Organization Skills exports the currently filtered skill outcomes, and Admin Courses exports the currently filtered lifecycle/oversight view. Export actions show shared success feedback. No PDF dependency or backend export endpoint was added.

## Loading patterns

`LoadingState` provides consistent status text, `aria-live`, and `aria-busy` behavior for simple data loads. Long-running product processes such as knowledge processing, course generation, assessment analysis, path generation, and practical evaluation retain their meaningful step-based progress experiences.

## Empty states

`EmptyState` communicates what is missing, why it is empty, and an action only when a valid destination exists. It is used through shared Organization/Admin wrappers and the notification center. Existing feature-specific empty states remain where their contextual copy is stronger.

## Errors and retry

`ErrorState` provides an announced error and optional Retry action. Organization and Admin state wrappers now share this primitive. Notification API-mode failure is presented as a safe contract limitation without exposing raw exceptions or sending an undocumented request.

## Success feedback

Temporary global feedback continues through the application-level toast provider with success, error, and information variants. Function 20 uses it for notification read changes and filtered CSV exports. Inline validation remains beside its input and is not replaced by a toast.

## Confirmation

The existing shared `ConfirmationDialog` remains the single confirmation pattern. It provides dialog semantics, focus trapping/restoration, Escape handling, scroll locking, cancel/confirm actions, loading protection, and destructive intent. Function 20 adds a focused preview but no unnecessary confirmation to harmless notification or export actions.

## Disabled states

Important disabled actions retain adjacent explanations. The supporting-state preview demonstrates an associated disabled Publish action and reason. Existing Generate, Publish, wizard, assessment, and credential rules remain feature-owned.

## Mock behavior and persistence

Notifications are loaded from deterministic, role-scoped fixtures. Only read notification IDs persist in localStorage under the current user and audience; source notification definitions remain immutable. A custom browser event keeps the shell badge and notification page synchronized. Reports derive from the same Function 17, Organization, and Admin fixtures already used on screen.

## Bypass and API behavior

With `NEXT_PUBLIC_FRONTEND_BYPASS=true`, every Function 20 route/state works without a backend. With bypass/demo mocks disabled, the notification service returns a readable unavailable state because `API_doc.md` documents no notification endpoint. CSV generation remains a client-side view export and makes no API call.

## API limitations

`API_doc.md` does not document notification feeds, read receipts, delivery preferences, report generation, analytics export, Organization reporting, Admin reporting, or a common backend error taxonomy. No endpoint or request body was guessed. Production integration needs documented authorization, pagination, delivery/read-state, export-job, retention, and privacy contracts.

## Known limitations

- Notifications are seeded frontend records; there is no real-time, push, email, or cross-device delivery.
- Read state is browser-local and not synchronized across devices.
- CSV exports contain the current deterministic frontend dataset, not a server-authoritative report.
- The global Not Found page provides general recovery; feature routes may use more specific entity recovery states.
- Full interaction and visual acceptance across every viewport remains a product QA responsibility.
