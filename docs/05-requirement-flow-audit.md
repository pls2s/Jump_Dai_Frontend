# SkillSync AI — Requirement & Flow Audit

## Audit Date

16 August 2026

## Sources

- `JUMP_DAI_MVP` — requested source; no matching PDF was present in the project root, `docs/`, or `docs/reference/`, so it was not read.
- `SkillSync AI Function Design Order` — requested source; no matching DOCX was present in the project root, `docs/`, or `docs/reference/`, so it was not read.
- Product requirement checklist supplied in the audit request — working source of truth for this audit.
- Existing repository implementation and feature documentation.

## Status Legend

- **Implemented** — major required UI, interaction, navigation, and critical states complete the frontend user goal.
- **Partial** — meaningful UI or behavior exists, but the function cannot yet complete its frontend goal.
- **Missing** — required behavior is absent from an otherwise current function.
- **Future** — intentionally outside the current developed scope.
- **Needs Fix** — current behavior contradicts a dependency or creates a broken journey.
- **Needs Review** — repaired frontend flow is complete enough for product/design acceptance testing but still uses mocks.

## Requirement Coverage Matrix

No granular requirement identifiers were available beyond Function IDs 00–20.

### 00 — Design Foundation

- **Requirement IDs:** 00
- **Current routes:** `/ui-preview` (development only); shared components apply across product routes.
- **Current status:** Partial.
- **Implemented behavior:** Semantic colors, Anuphan typography, spacing/radius/elevation tokens, Button, Input, Select, Badge, cards, fields, sidebar, topbar, progress, stepper, focus styles, and responsive layouts.
- **Missing behavior:** No shared toast primitive. Delete modal and reference drawer remain feature-owned rather than a generalized modal system.
- **Flow problems found:** Development-only UI preview was linked from authentication screens.
- **Changes made:** Removed all development-route links and copy from product authentication routes; retained `/ui-preview` only as an internal route. Improved dialog focus, Escape handling, labels, and background scroll behavior where used.
- **Remaining work:** Consolidate feature dialogs/toasts only when another production use case justifies reusable primitives.

### 01 — User & Authentication

- **Requirement IDs:** 01
- **Current routes:** `/`, `/sign-in`, `/create-account`, `/verify-otp`, `/account-type`, `/creator/account`, `/learner/onboarding`, `/organization/onboarding`.
- **Current status:** Needs Review.
- **Implemented behavior:** A centralized environment switch selects frontend demo or API-connected behavior. Demo mode completes fixture sign-in, invalid-credential handling, direct role access, registration, six-digit OTP, workspace selection, persistent password-free session, role routing, account display, client guard, and logout without a backend. API mode retains exact documented login/register/current-user calls, Bearer-token session, API errors, and local logout.
- **Missing behavior:** API endpoints for OTP/resend/workspace/logout/profile update, auth role fields in API responses, server authorization, password-reset delivery, Google OAuth, and production session security.
- **Flow problems found:** Brand panel appeared on the right; developer copy appeared in product UI; any credentials succeeded; OTP accepted any digits; Learner/Organization selections were dead ends; profile was read-only; Creator routes were not mock role-guarded.
- **Changes made:** Reversed and rebalanced auth layout; removed developer copy; matched documented snake_case login/register/me contracts; centralized mode selection; isolated demo credential matching in the auth service; added direct demo access, temporary registration/OTP state, workspace routing, mode-aware account loading, role guards, refresh continuity, and logout. No guessed API request is issued for undocumented capabilities.
- **Remaining work:** Product-review the demo journey; define any required role/workspace, OTP, logout, and profile-update contracts in `API_doc.md`; live-test API mode; then replace browser token storage with secure server sessions before production.

### 02 — Create Course / Course Configuration

- **Requirement IDs:** 02
- **Current routes:** `/creator/courses/new/basics`, `/audience`, `/objectives`, `/certificate`, `/review`.
- **Current status:** Needs Review.
- **Implemented behavior:** Five-step wizard; course name/description; target learner; Beginner/Intermediate/Advanced; multiple objectives; certificate toggle and criteria; persistent values; Back; Continue; Save & exit; review; Edit links; final source handoff.
- **Missing behavior:** Backend draft records, per-course persistence, collaborative editing, and true autosave status.
- **Flow problems found:** Only course name controlled Continue; empty descriptions, audiences, or objectives could be skipped; disabled action did not explain all dependencies; nonfunctional drag affordance implied objective reordering.
- **Changes made:** Added step-specific and full-review validation, accessible guidance, disabled-reason messaging, length limits, Save & exit success feedback, removed the false reorder affordance, and routed submission through a mode-aware service so demo mode never requires course APIs.
- **Remaining work:** Bind wizard state to real course IDs and backend drafts.

### 03 — Knowledge Upload

- **Requirement IDs:** 03
- **Current routes:** `/creator/courses/digital-marketing-foundations/sources`.
- **Current status:** Needs Review.
- **Implemented behavior:** PDF/document/slide file selection and drag/drop; file size/type validation; upload progress; processing; ready; failure; retry; manual text validation; URL validation; mock fetch/preview/error; delete confirmation; empty state; persistent mock sources; explicit AI readiness rule.
- **Missing behavior:** Real storage, parsing, virus scanning, URL retrieval, extraction details, and backend persistence.
- **Flow problems found:** Unsupported/oversized files were silently accepted; text relied only on native validation; URL fetch could not fail; source state reset on reload; AI dependency could be bypassed by manually opening analysis after deleting sources.
- **Changes made:** Added specific errors and recovery copy, source persistence, success feedback, retry behavior, disabled reason, cross-route ready-source guard, and mode-aware separation between slug-based local sources and numeric API documents.
- **Remaining work:** Replace simulated timers and local data with upload/processing services.

### 04 — AI Knowledge Processing

- **Requirement IDs:** 04
- **Current routes:** `/creator/courses/digital-marketing-foundations/analysis`; failure-state QA route adds `?state=failed`.
- **Current status:** Needs Review.
- **Implemented behavior:** Reading, topic extraction, concept summarization, relationship mapping, sequencing, grounded-context retrieval, source linking, partial progress, failure/retry, completion, topic/concept inspection, reference drawer, relationship chain, recommended order, source review, and generation handoff.
- **Missing behavior:** Real AI/RAG execution, creator edits to analysis, accepting/rejecting topics, and persistence of analysis output.
- **Flow problems found:** No failure or retry state; direct analysis ignored deleted sources; pipeline omitted an explicit grounded-retrieval stage; unknown course IDs rendered product UI.
- **Changes made:** Added missing-source guard, failure/retry state, grounded retrieval step, dynamic entity validation, accessible reference drawer behavior, and clearer intentional generation CTA.
- **Remaining work:** Connect source-aware analysis output and approval/editing services. Full generated-content editing belongs to Function 06 after generation.

### 05 — AI Course Generator

- **Requirement IDs:** 05
- **Current routes:** `/creator/courses/digital-marketing-foundations/generate`.
- **Current status:** Future / Not Started.
- **Implemented behavior:** Intentional destination confirms knowledge analysis is complete, identifies future outline/module/lesson/exercise/quiz/assessment outputs, and provides Back navigation.
- **Missing behavior:** All generator functionality.
- **Flow problems found:** Earlier placeholder did not explicitly protect the later review-before-publish dependency.
- **Changes made:** Clarified readiness, next feature scope, and that publishing remains unavailable until Creator Review.
- **Remaining work:** Implement generator in the next feature task.

### 06 — Creator Review / Human Verification

- **Requirement IDs:** 06
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** Current analysis can be inspected and traced before generation; no generated-content review is falsely claimed.
- **Missing behavior:** Generated-content editing, traceability, review status, and approval.
- **Flow problems found:** None in current routes; future dependency needed explicit protection.
- **Changes made:** Generation placeholder states that review is required before publishing.
- **Remaining work:** Build only after Function 05 produces generated content.

### 07 — Course Preview & Publishing

- **Requirement IDs:** 07
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** No Publish action exists, so review cannot be bypassed.
- **Missing behavior:** Preview, publish/unpublish, Draft/Review/Published/Unpublished transitions, eligibility checks.
- **Flow problems found:** None; no premature Publish control was present.
- **Changes made:** Added review-before-publish explanation to the Function 05 placeholder.
- **Remaining work:** Implement after Function 06.

### 08 — Learning Goal & Learning Style

- **Requirement IDs:** 08
- **Current routes:** `/learner/onboarding` placeholder.
- **Current status:** Future / Not Started.
- **Implemented behavior:** Learner role reaches an honest destination without Creator access.
- **Missing behavior:** Goal and supported preference collection.
- **Flow problems found:** Learner selection previously could not continue.
- **Changes made:** Added intentional learner onboarding placeholder and account-type return path.
- **Remaining work:** Implement learner onboarding before pre-assessment.

### 09 — Pre-Assessment

- **Requirement IDs:** 09
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Intro, questions, answers, attempt, submission, result processing, and personalized-learning dependency.
- **Flow problems found:** No current learner routes contradict the dependency.
- **Changes made:** None beyond documenting the required order.
- **Remaining work:** Implement before Function 11 for personalized courses.

### 10 — Skill Gap Analysis

- **Requirement IDs:** 10
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Skill score, strengths, areas to improve, weak topics, and recommendations.
- **Flow problems found:** None in current scope.
- **Changes made:** None.
- **Remaining work:** Define score thresholds and derive weak topics from assessment results.

### 11 — Personalized / Adaptive Learning Path

- **Requirement IDs:** 11
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Goal/background/assessment-based path generation, adaptation, weak-topic response, and additional content recommendations.
- **Flow problems found:** None; there is no premature path route.
- **Changes made:** Documented dependency on Functions 08–10 and latest results.
- **Remaining work:** Implement only after assessment contracts exist.

### 12 — Learning Experience

- **Requirement IDs:** 12
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Lesson access, materials, progress, last position, mandatory/optional status, and prerequisites.
- **Flow problems found:** None.
- **Changes made:** None.
- **Remaining work:** Implement after a published course and learner path exist.

### 13 — Quiz / Post-Assessment

- **Requirement IDs:** 13
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Quiz/post-assessment, passing score, attempt, optional timer, and results.
- **Flow problems found:** None.
- **Changes made:** None.
- **Remaining work:** Define assessment and passing-criteria contracts.

### 14 — Practical Assessment & Submission

- **Requirement IDs:** 14
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Task, evidence submission, rubric, grading status, and Creator review.
- **Flow problems found:** None.
- **Changes made:** None.
- **Remaining work:** Implement secure evidence upload and review workflow.

### 15 — Skill Result & Feedback

- **Requirement IDs:** 15
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None.
- **Missing behavior:** Skill score, competency level, strengths, improvements, and assessment feedback.
- **Flow problems found:** None.
- **Changes made:** None.
- **Remaining work:** Implement after assessment scoring is available.

### 16 — Skill Evidence / Portfolio / Credential

- **Requirement IDs:** 16
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** None; no skill is labeled Verified and no credential is shown as issued.
- **Missing behavior:** Evidence, verification, competency score, portfolio, mapping/sharing, badges, certificates, and verification.
- **Flow problems found:** None; eligibility is not misrepresented.
- **Changes made:** None.
- **Remaining work:** Enforce assessment/evidence and certificate eligibility before issuance.

### 17 — Creator Dashboard & Analytics

- **Requirement IDs:** 17
- **Current routes:** `/creator/analytics`.
- **Current status:** Future / Not Started.
- **Implemented behavior:** Honest empty state with a route back to the active course.
- **Missing behavior:** Learner count/progress, completion, scores, common errors, gaps, insights, filters, and export.
- **Flow problems found:** Static route could be mistaken for implemented analytics.
- **Changes made:** Roadmap now classifies it as Not Started rather than implemented.
- **Remaining work:** Build after published courses generate learner data.

### 18 — Organization Workspace

- **Requirement IDs:** 18
- **Current routes:** `/organization/onboarding` placeholder.
- **Current status:** Future / Not Started.
- **Implemented behavior:** Role-specific placeholder, account-type return, and logout.
- **Missing behavior:** Organization profile, members, roles, invitations, assignments, and permission-aware progress.
- **Flow problems found:** Organization role previously could not continue.
- **Changes made:** Added intentional placeholder that does not grant Creator/Admin access.
- **Remaining work:** Implement organization permissions before member data.

### 19 — Administrator

- **Requirement IDs:** 19
- **Current routes:** None.
- **Current status:** Future / Not Started.
- **Implemented behavior:** Admin is absent from registration and explicitly system-assigned.
- **Missing behavior:** User, role, content, account, and audit-access management.
- **Flow problems found:** None; no Admin self-selection or route exists.
- **Changes made:** Role guard prevents non-Creator mock roles from entering Creator routes.
- **Remaining work:** Add server-assigned Admin authorization before any Admin UI.

### 20 — Notifications / Reports / Supporting States

- **Requirement IDs:** 20
- **Current routes:** Supporting states are embedded in Functions 01–04; analytics is `/creator/analytics`.
- **Current status:** Partial.
- **Implemented behavior:** Loading, error, success, validation, disabled reasons, empty states, retries, and confirmation dialogs for current functions.
- **Missing behavior:** Notification center, report generation/export, global toast system, and backend failure taxonomy.
- **Flow problems found:** Several current flows lacked explicit failures or disabled reasons.
- **Changes made:** Added auth/OTP/source/URL/AI errors, success feedback, retries, and dependency explanations.
- **Remaining work:** Add notifications and exports only with the owning future features.

## Creator End-to-End Flow

| Transition | Status | Audit result |
| --- | --- | --- |
| Authentication → Creator workspace | Working | Valid demo sign-in or Creator account selection sets mock role/session and routes to `/creator`. |
| Creator workspace → Course Configuration | Working | Home and My Courses provide real links to `/creator/courses/new/basics`. |
| Course Configuration → Knowledge Upload | Working | Review CTA is enabled only after all current required data is valid. |
| Knowledge Upload → AI Processing | Working | Requires at least one Ready source; direct-route bypass is guarded. |
| AI Processing → Completed Analysis | Working | Visible stages, failure/retry, and result inspection are connected. |
| Completed Analysis → AI Course Generator | Partial | Destination works; generator itself is Future / Not Started. |
| AI Course Generator → Creator Review | Future | Must be implemented next after generation. |
| Creator Review → Preview | Future | No bypass exists. |
| Preview → Publish | Future | No Publish control exists. |

## Learner End-to-End Flow

| Transition | Status |
| --- | --- |
| Authentication → Learner onboarding placeholder | Working |
| Goal / Style → Pre-Assessment | Future |
| Pre-Assessment → Skill Gap | Future |
| Skill Gap → Personalized Path | Future |
| Personalized Path → Learning | Future |
| Learning → Assessment | Future |
| Assessment → Skill Result | Future |
| Skill Result → Portfolio / Credential | Future |

No learner path, Verified Skill, badge, or certificate is prematurely exposed.

## Role Flow

- **Learner:** Selectable at account type; routes to `/learner/onboarding`; cannot enter the Creator shell under the mock guard.
- **Creator:** Selectable; routes to `/creator`; current Creator functions 01–04 are available.
- **Organization:** Selectable; routes to `/organization/onboarding`; cannot enter Creator/Admin functionality.
- **Admin:** Not selectable; no route exists; future access must be system-assigned and server-authorized.

## Route Audit

| Route | Entry | Primary action / success | Back destination | Failure state | Role | Dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Direct | Redirect to sign-in | — | — | Public | None |
| `/sign-in` | Root/logout | Workspace by account type in demo; Creator prototype in API mode | Create account | Validation, invalid credentials, network/API errors in API mode | Public | Demo fixture or backend login selected centrally |
| `/create-account` | Sign-in | OTP in demo; sign-in notice in API mode | Sign-in | Field validation and mode-appropriate errors | Public | Demo temporary registration or backend registration |
| `/verify-otp` | Demo registration | Account type | Create account | Incomplete/invalid OTP or missing temporary registration; intentional API contract-gap state | Public | Demo registration context; no documented API endpoint |
| `/account-type` | Verified demo OTP | Selected workspace | Verify OTP | Missing/unverified registration; intentional API contract-gap state | Public | Verified demo registration; no documented API endpoint |
| `/learner/onboarding` | Learner auth | Sign out | — | Wrong role redirects; future placeholder | Demo Learner | Learner demo session |
| `/organization/onboarding` | Organization auth | Sign out | — | Wrong role redirects; future placeholder | Demo Organization | Organization demo session |
| `/creator` | Creator login/demo access | Create/continue course | — | Missing/wrong-role demo session redirects | Creator | Matching demo session or API session |
| `/creator/courses` | Sidebar/home | Create/manage documents | Creator home | Demo empty/local state or API loading/network errors | Creator | Mode-aware local list or `GET /api/courses` |
| `/creator/courses/new/[step]` | Create/Continue/Edit | Demo source workspace or backend course documents | Previous step/home | Validation and mode-appropriate create errors | Creator | Prior values; local demo submission or `POST /api/courses` on Review |
| `/creator/courses/[courseId]/sources` | Created/listed course | File upload/status/delete | My Courses | Upload/list/delete and mock URL/source failures | Creator | Local behavior for demo slug; documented APIs for numeric IDs in API mode |
| `/creator/courses/[courseId]/analysis` | Ready source CTA on seeded demo | Generation placeholder | Sources | Unknown course 404; missing-ready-source; simulated AI failure/retry | Authenticated prototype | Local mock sources; no documented analysis endpoint |
| `/creator/courses/[courseId]/generate` | Completed analysis | Back to analysis | Analysis | Unknown/ineligible course 404 | Creator | Analysis completion implied by entry |
| `/creator/account` | Profile links | Refresh/sign out | Sidebar navigation | Loading/current-user API error in API mode | Creator | Demo session or `GET /api/auth/me`; local session clear for logout |
| `/creator/analytics` | Sidebar | Continue active course | Sidebar navigation | Honest empty state | Creator | Published course data (not available) |
| `/ui-preview` | Direct development URL only | Internal component inspection | — | — | Development | None |

## Interaction Audit

### Problems discovered

- Authentication marketing and form panels were reversed from the required hierarchy.
- Authentication exposed a development-only `/ui-preview` link.
- Login, OTP, and URL actions could not fail meaningfully.
- Learner and Organization selections disabled continuation and trapped the user.
- Profile appeared interactive only through navigation but could not be edited.
- Course Continue validated only the name, regardless of current step.
- A decorative grip implied objective reordering without supporting it.
- Source inputs lacked supported-file/size/manual-text/URL failure handling.
- Sources were lost on reload and the analysis dependency could be bypassed by URL.
- AI processing had no failure/retry state.
- Unknown dynamic course IDs rendered current workspaces.
- Source delete and reference dialogs lacked complete Escape/focus/scroll behavior.
- The create-course empty card lacked a direct action despite visual emphasis.

### Resolution

- Rebalanced blue-left/white-right authentication layout with a compact mobile hierarchy.
- Removed development copy and links from product routes.
- Added deterministic demo validation, errors, success, loading, OTP, and retry states behind one environment switch.
- Added direct demo access, role-specific future placeholders, refresh-safe sessions, role routing, and logout.
- Added editable profile fields and save/logout feedback.
- Added wizard validation and disabled-reason text for every step.
- Removed the unsupported reorder affordance.
- Added file/text/URL validation and explicit recovery actions.
- Persisted mock sources and enforced the Ready-source dependency on both CTA and destination.
- Added AI failure/retry and missing-source states.
- Added route-entity/dependency 404 checks.
- Improved dialog semantics, initial focus, Escape close, and background scroll handling.
- Added a real Create course link to the empty-state card.
- Preserved documented API calls behind the same mode-aware services, without scattering environment checks through UI components.

## Business Rule Integrity

1. Mock role access routes Creator, Learner, and Organization to different areas; Admin is never self-selectable.
2. Generated content cannot be published because generation, review, preview, and publishing are not yet implemented.
3. Current analysis exposes mock source names, locations, excerpts, and reference counts.
4. Personalized learning has no premature route and remains dependent on future pre-assessment.
5. Weak-topic thresholds are not yet implemented and are not claimed.
6. Adaptive paths are not yet implemented and are not claimed.
7. No skill is marked Verified.
8. No assessment is marked passed without criteria.
9. No credential is shown as issued.
10. Certificate criteria are shown whenever the course certificate is enabled.
