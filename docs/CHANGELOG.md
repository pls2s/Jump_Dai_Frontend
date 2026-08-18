# Changelog

## 2026-08-18 — Organization Workspace

### Added

- Added a dedicated Organization shell with Overview, Courses, Learners, and Skills & Outcomes navigation.
- Added organization learning metrics, lifecycle-aware course views, and shared course performance analytics.
- Added fictional learning-only learner overview/detail and aggregate skill outcome views.
- Added working course, status, time-range, learner-status, and skill-coverage filters.
- Added empty Organization, no learner activity, loading, error/retry, unknown course, and unknown learner states.

### Changed

- Organization authentication now routes to `/organization`; the legacy `/organization/onboarding` URL redirects forward.
- Reused Function 17 course, assessment, skill, and content analytics rather than creating a conflicting model.
- Added Function 18 routes and state variants to the development-only frontend preview index.

No Organization backend endpoint, new backend role, Admin UI, HRM, payroll, recruitment, or assignment system was added.

## 2026-08-17 — Creator Dashboard & Analytics

### Added

- Added Creator overview metrics and course lifecycle summary.
- Added course/time filters, learner progression funnel, and deterministic drop-off insight.
- Added course, assessment, skill, and learning-content performance views.
- Added explainable attention/insight rules, course analytics detail, and client-side CSV export.
- Added no-published-course, no-learner-activity, loading, error/retry, and non-published analytics states.

### Changed

- Replaced the `/creator/analytics` placeholder with the Function 17 frontend experience.
- Connected Published course actions from Creator Home and My Courses to course analytics.
- Added Function 17 routes to the development-only frontend preview index.
- Configured the production build script to use Next.js 16’s supported Webpack builder because the restricted development environment blocks Turbopack’s local PostCSS worker port.

No backend analytics endpoint, Organization workspace, or Admin UI was added.

## 2026-08-17 — Design foundation and authentication completion

### Added

- Added an application-level accessible toast system for success, error, and information feedback.
- Added persisted two-minute demo OTP expiry, incomplete/invalid/expired states, Resend code loading, and resend/verification success feedback.
- Added demo/bypass Creator profile editing with View, Edit, Save, Cancel, validation, refresh persistence, workspace/role display, and confirmed logout.

### Changed

- Removed the root layout’s standalone typecheck dependency on generated `LayoutProps` types.
- Strengthened the shared confirmation dialog with focus trapping, focus restoration, Escape handling, loading protection, and background scroll locking.
- Reused the shared confirmation dialog for knowledge-source deletion.
- Consolidated course, portfolio, skill-evidence, and credential copy feedback into the shared toast system.
- Kept API-mode profile editing and OTP/resend unavailable because `API_doc.md` documents no matching endpoints.

No Function 17 analytics implementation or new backend contract was added.

## 2026-08-16 — Functions 12–15 flow audit

### Changed

- Kept completed lesson content visible until the learner intentionally chooses the next personalized activity, while preserving resume-at-next-incomplete behavior.
- Exposed personalized activity formats, lesson completion counts, and accessible Not started/In progress/Completed navigation state.
- Added a persisted staged Post-Assessment analysis state and exact-answer result count.
- Added clearer practical strengths/improvement feedback and deterministic task/draft preview states.
- Added direct bypass previews for completed/missing learning, quiz results, Post-Assessment analysis, practical task/draft, and completed/more-practice Skill Result outcomes.
- Re-audited centralized completion and verification rules without changing Creator Functions 01–07, Learner Functions 08–11, or the existing Function 16 implementation.

Lesson content, scoring, practical evaluation, and verification remain frontend simulations; no backend grading, AI evaluation, or skill authority is claimed.

## 2026-08-16 — Functions 09–11 flow audit

### Changed

- Re-audited the complete Learning Goal & Style → Pre-Assessment → Skill Gap → Personalized Learning Path journey, including dependency gates, autosave, scoring, direct bypass previews, generation retry, and downstream handoff.
- Limited the learner-facing priority summary to the three lowest competencies while preserving every score for personalized path generation.
- Replaced an internal pre-assessment attempt identifier in the learning-path UI with understandable assessment provenance and completion date.
- Updated Functions 09–11 roadmap, feature, and flow-audit documentation without changing later learner functions.

Assessment scoring and learning-path generation remain deterministic frontend simulations; no backend assessment or personalization service is claimed.

## 2026-08-16 — Function 08 flow audit

### Changed

- Confirmed the existing Learner workspace, onboarding validation, option controls, persistence, editable return state, and Pre-Assessment handoff against the Function 08 requirements.
- Marked the learner demo course as Published and added the Pre-Assessment entry to the Function 08 development preview group.

No Creator Function 01–07 behavior or later Learner implementation was changed.

## 2026-08-16 — Skill evidence, portfolio, and credential

### Added

- Added a learner Skill Portfolio with Overview, Skills, Evidence, and Credentials sections derived from saved learner results.
- Added per-skill evidence detail, before/after improvement, practical rubric traceability, result links, and an evidence timeline.
- Added Verified, Proficient, Developing, and Needs more practice presentation with learner-friendly reasons and next actions.
- Added credential eligibility checks, eligible/issued/not-eligible states, certificate-disabled behavior, and a professional credential preview.
- Added copy-link feedback, browser Print / Save as PDF, empty portfolio, partial evidence, and direct bypass preview states.
- Added an explicit eligible → claiming → issued demo transition persisted in the existing learner journey.

### Changed

- Connected Skill Result and completed-course Learner Home states to the Skill Portfolio.
- Extended the existing Function 15 verification engine for per-skill decisions instead of introducing a competing verification rule.
- Added Portfolio to learner navigation and Function 16 to the frontend preview index.
- Corrected Skill Result and Learner Home credential copy so completion no longer implies issuance before the learner claims an eligible credential.

Portfolio evidence, credential eligibility, issue dates, and `SS-DEMO-*` identifiers are frontend-derived demo behavior. No backend credential issuance, public verification, production PDF, or external sharing integration is claimed.

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
