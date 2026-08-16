# Changelog

## 2026-08-16 — Frontend-only Demo Mode

- Added centralized `NEXT_PUBLIC_FRONTEND_DEMO_MODE` configuration with demo mode enabled in the local development template.
- Added browser-only sign-in against shared development fixtures plus direct Creator, Learner, and Organization demo access.
- Added simulated registration, six-digit OTP verification with development OTP `123456`, and account-type routing without backend requests.
- Added password-free persistent demo sessions, role-aware guards, refresh continuity, and working local logout.
- Routed demo course creation/listing, account display, and source management through frontend services while preserving the existing API-connected path.
- Documented how to run the full frontend journey without a backend and how to return to API mode.

## 2026-08-16 — API contract alignment audit

- Read and audited all endpoints, schemas, status transitions, errors, authentication rules, and future examples in `API_doc.md`.
- Added a shared API client that preserves the documented success/error envelope, snake_case fields, Bearer authentication, and multipart upload behavior.
- Removed invented OTP verification, OTP resend, and workspace-selection API calls and removed undocumented auth response assumptions.
- Matched login, registration, and current-user requests and responses exactly; made profile data read-only and disclosed local-only logout.
- Connected course creation and backend course listing to documented course endpoints.
- Connected document upload, list/status refresh, and delete to documented document endpoints.
- Kept manual text, URL sources, document retry, knowledge analysis, and future generation/review/learning modules explicitly simulated or unimplemented where the API contract has no matching endpoint.
- Documented the stale Vite/port 5173 CORS guidance versus the current Next.js/port 3000 frontend.

## 2026-08-16 — Backend authentication client and demo fixtures

- Mirrored Learner, Creator, and Organization backend seed users in `src/data/mock/auth-users.ts`, including the Organization `creator` role.
- Added development-only demo account references and quick-fill actions; removed local email/password comparison.
- Connected sign-in and registration to the documented backend endpoints at the configured API origin.
- Added backend response handling, actionable network/API errors, and token/session storage.
- Replaced legacy authentication flags in Creator/Learner/Organization guards and logout actions with the shared session adapter.
- Removed the hardcoded frontend OTP; the later API contract audit removed the undocumented endpoint configuration entirely.
- Added `.env.example` and documented demo accounts, backend requirements, auth QA steps, and current API contract mismatches.

## 2026-08-16 — Requirement and flow audit

- Reversed and rebalanced authentication split-screen layout to blue brand panel left and white form panel right.
- Added compact, task-first mobile authentication layout.
- Removed the development-only UI preview link and copy from authentication routes.
- Added invalid login, registration validation, OTP invalid/expired/resend, and logout feedback states.
- Added role-aware Creator routing plus intentional Learner and Organization onboarding placeholders.
- Added editable Creator profile fields and save feedback.
- Added course-wizard required-field validation and clear disabled-action guidance.
- Removed the unsupported learning-objective reorder affordance.
- Added file type/size, manual text, and URL validation and recovery states.
- Persisted mock knowledge sources and enforced the Ready-source dependency before analysis.
- Added AI missing-source, failure, retry, partial-progress, and completed states.
- Added unknown/ineligible course route handling.
- Improved delete dialog and source-reference drawer keyboard/focus behavior.
- Added a complete Functions 00–20 requirement and journey audit.
- Updated roadmap statuses to distinguish complete flows, partial functionality, placeholders, and future work.
