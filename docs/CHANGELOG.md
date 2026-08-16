# Changelog

## 2026-08-16 — Learning experience through skill result

### Added

- Added personalized-order lesson delivery, compact responsive path navigation, explicit lesson completion, saved current position, course progress, source attribution, and resume behavior.
- Added reusable quick-quiz and Post-Assessment flows with MCQ/multi-select answers, validation, saved attempts, feedback, pass/fail criteria, retry, and pre/post skill comparison.
- Added a structured practical campaign-plan task, persistent draft, confirmation, staged mock evaluation, weighted rubric, evidence summary, pass/needs-practice feedback, and retry.
- Added completion-gated Skill Result with before/after scores, practical evidence, concise feedback, centralized verification rules, and an intentional Function 16 destination.
- Added direct bypass previews for Functions 12–15.

### Changed

- Made bypass Sign In accept any non-empty credentials into a persistent Creator preview session without fixture matching or an API call.
- Preserved seeded credential matching in Demo Mode and documented backend login behavior when both frontend flags are disabled.
- Extended Learner Home to resume lessons, Post-Assessment, practical work, or the final result from saved state.

Lesson content, quiz scoring, practical evaluation, and skill results in this entry are frontend simulations; no backend grading, real file evidence, credential, or portfolio integration is claimed.

## 2026-08-16 — Learner assessment, skill gap, and personalized path

### Added

- Added an eight-question, one-at-a-time Pre-Assessment with multiple-choice and multiple-select answers, autosaved progress, unanswered validation, submission review, and staged evaluation.
- Added centralized assessment scoring, competency status bands, below-60 priority detection, strengths, and read-only answer explanations.
- Added assessment-gated personalized path generation using learner goal, content preferences, pace, and per-skill scores.
- Added priority, recommended, and quick-refresher path items, generation failure/retry, evidence/version metadata, and shared journey persistence.
- Added direct bypass previews for Functions 09–11 and an intentional Function 12 handoff route.

### Changed

- Connected Function 08 directly to the complete Pre-Assessment → Skill Gap → Personalized Learning Path flow.
- Expanded the learner route context and development preview index through Function 11.
- Updated Learner Home to resume the saved learning profile, assessment, Skill Gap, or learning path stage instead of always restarting onboarding.

All assessment scoring and path generation in this entry are deterministic frontend simulations; no backend assessment or personalization integration is claimed.

## 2026-08-16 — Learning profile and course-tree refinement

### Changed

- Replaced heavy generated-course module cards with a compact collapsible tree, lighter lesson rows, clearer active state, long-title wrapping, and more main-content width.
- Added viewport-bounded sticky course navigation on desktop and a dismissible structure drawer on mobile.

### Added

- Added a minimal role-separated Learner workspace and Digital Marketing Foundations course entry.
- Added Function 08 learning goal, optional detail, familiarity, content preference, pace, and optional session-length controls with inline validation.
- Added per-learner/course browser persistence and editable return behavior.
- Added the intentional Function 09 Pre-Assessment entry destination without assessment questions or scoring.

## Frontend bypass mode

### Added

- Added the default-off `NEXT_PUBLIC_FRONTEND_BYPASS` development switch and synthesized `Frontend Preview` Creator identity.
- Added the bypass-only `/dev/frontend-preview` route index for direct access to Functions 01–07 and implemented state variants.
- Added the reusable `demo-course-1` fixture and fallback generated-course state for dependency-free screen review.
- Added preview controls on Sign In and OTP while retaining the existing forms.

### Changed

- Preserved the existing route guards while allowing their shared session lookup to resolve locally in bypass mode.
- Centralized frontend mock selection so bypass review does not call authentication or course APIs.
- Added direct preview query states for file/text/URL sources and processing/result analysis screens.

## 2026-08-16 — Creator generation, verification, and publishing flow

### Added

- AI course generation entry, staged progress, failure/retry, and persisted generated-course hierarchy.
- Structured modules, lessons, learning objectives, exercises, Creator quiz previews, practical task, rubric, and final assessment fixtures.
- Creator Review workspace with focused editing, Save/Cancel, unsaved-change confirmation, per-item review status, and verification progress.
- Source-grounded generated-content inspection using the shared reference drawer.
- Responsive learner-style course preview and reusable publish-readiness checklist.
- Publish confirmation, simulated failure/retry, published success, copy-link feedback, unpublish confirmation, and republish flow.
- Draft, Review, Published, and Unpublished lifecycle persistence and My Courses actions.

### Changed

- Connected completed AI Knowledge Processing directly to the real frontend Course Generator.
- Extracted source-reference inspection from Function 04 for reuse in generation and review.
- Updated Creator navigation context and course-list status behavior for Functions 05–07.

All AI generation, verification, publishing, and unpublishing behavior in this entry is frontend-only; no backend integration is claimed.

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
