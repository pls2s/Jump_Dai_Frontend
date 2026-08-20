# SkillSync AI — Requirement & Flow Audit

## Audit Date

17 August 2026

## Sources

- `JUMP_DAI_MVP` — requested source; no matching PDF was present in the project root, `docs/`, or `docs/reference/`, so it was not read.
- `SkillSync AI Function Design Order` — requested source; no matching DOCX was present in the project root, `docs/`, or `docs/reference/`, so it was not read.
- Product requirement checklist supplied in the audit request — working source of truth for this audit.
- Existing repository implementation and feature documentation.

## Status Legend

- **Implemented** — major required UI, interaction, navigation, and critical states complete the frontend user goal.
- **Partial** — meaningful UI or behavior exists, but the function cannot yet complete its frontend goal.
- **Placeholder** — an intentional destination exists, but the primary frontend goal is not implemented.
- **Not Started** — no meaningful frontend implementation exists.

## Final Function Classification

This classification evaluates the frontend goal, navigation, major interactions, validation, and critical states. A missing backend contract does not reduce an otherwise complete mock/demo frontend to Partial.

| Function | Classification | Evidence summary |
| --- | --- | --- |
| 00 Design Foundation | Implemented | Shared tokens, controls, toast, confirmation dialog, supporting states, responsive/focus foundations, and passing lint/type/build checks. |
| 01 Authentication | Implemented | Login, registration, expiring/resendable OTP, workspace routing, profile editing, logout, bypass, and safe API-mode behavior. |
| 02 Create Course | Implemented | Validated five-step configuration flow with persistence and knowledge-source handoff. |
| 03 Knowledge Upload | Implemented | File/text/URL source states, validation, retry/delete, persistence, and readiness rules. |
| 04 AI Knowledge Processing | Implemented | Staged analysis, failure/retry, results, grounding, and generator handoff. |
| 05 AI Course Generator | Implemented | Staged generation, failure/retry, structured result, source grounding, and review handoff. |
| 06 Creator Review / Human Verification | Implemented | Editable review workspace, source traceability, per-item status, persistence, and verification rules. |
| 07 Preview & Publishing | Implemented | Preview, readiness, confirmations, publish failure/retry, lifecycle, and unpublish/republish. |
| 08 Learning Goal & Learning Style | Implemented | Learner entry, validated editable preferences, persistence, and Pre-Assessment handoff. |
| 09 Pre-Assessment | Implemented | Resumable MCQ/multi-select flow, review, validation, analysis, and scoring. |
| 10 Skill Gap | Implemented | Derived priorities, strengths, statuses, and read-only answer review. |
| 11 Personalized / Adaptive Learning Path | Implemented | Assessment-gated, preference-aware path generation, retry, versioning, and persistence. |
| 12 Learning Experience | Implemented | Personalized content order, completion/resume progress, quick-check handoff, and responsive navigation. |
| 13 Quiz / Post-Assessment | Implemented | Saved quiz/Post-Assessment flows, validation, feedback, scoring, retry, and before/after comparison. |
| 14 Practical Assessment | Implemented | Structured draft, validation, confirmation, mock evaluation, rubric result, and retry. |
| 15 Skill Result & Feedback | Implemented | Completion-gated combined result, comparison, feedback, and centralized verification. |
| 16 Skill Evidence / Portfolio / Credential | Implemented | Evidence portfolio, skill detail, eligibility, explicit demo issuance, sharing, and print preview. |
| 17 Creator Dashboard & Analytics | Implemented | Working dashboard, filters, course/learner/assessment/skill/content analytics, states, and CSV export. |
| 18 Organization | Implemented | Workspace overview, courses, learners, skill outcomes, filters, access rules, and supporting states. |
| 19 Admin | Implemented | Authorized read-only oversight for users, courses, and activity with filters/details/states. |
| 20 Notifications / Reports / Supporting States | Implemented | Role-aware persisted notifications, scoped filtered exports, shared states, feedback/dialog consistency, and invalid-route recovery. |

## Requirement Coverage Matrix

No granular requirement identifiers were available beyond Function IDs 00–20.

### 00 — Design Foundation

- **Requirement IDs:** 00
- **Current routes:** `/ui-preview` (development only); shared components apply across product routes.
- **Current status:** Implemented.
- **Implemented behavior:** Semantic colors, Anuphan typography, spacing/radius/elevation tokens, Button, Input, Select, Badge, cards, fields, sidebar, topbar, progress, stepper, focus styles, responsive layouts, application-level success/error/information toasts, and a shared confirmation dialog.
- **Missing behavior:** No blocking frontend-foundation requirement remains. Feature-specific content drawers remain intentionally separate because they are navigation/inspection surfaces rather than confirmation dialogs.
- **Flow problems found:** Development-only UI preview was linked from authentication screens; temporary feedback was duplicated across product features; source deletion duplicated the confirmation pattern; standalone `tsc` depended on generated `LayoutProps` types.
- **Changes made:** Retained `/ui-preview` as an internal route and added feedback/dialog exercises there; added one accessible toast provider; consolidated copy, publish, profile, OTP, and credential feedback; reused the confirmation dialog for source deletion; added focus trapping/restoration and Escape/background-scroll handling; typed the root layout with its stable `ReactNode` contract rather than a generated route helper.
- **Remaining work:** Add future variants only when a concrete product use case requires them. The current foundation passes lint, standalone typecheck, and production build.

### 01 — User & Authentication

- **Requirement IDs:** 01
- **Current routes:** `/`, `/sign-in`, `/create-account`, `/verify-otp`, `/account-type`, `/creator/account`, `/learner`, `/learner/onboarding` (redirect), `/organization`, `/organization/onboarding` (redirect).
- **Current status:** Implemented (frontend); backend contract gaps documented.
- **Implemented behavior:** A centralized environment switch selects bypass, frontend demo, or API-connected behavior. Bypass accepts any non-empty credentials without API access. Demo mode completes fixture sign-in, validation, registration, six-digit OTP, persisted two-minute expiry, invalid/incomplete/expired states, resend/loading/success, workspace selection, persistent password-free session, role routing, editable locally persisted profile, guard behavior, logout confirmation, and refresh continuity. API mode retains exact documented register/login/current-user calls, Bearer-token session, API errors, read-only account display, and local logout.
- **Missing behavior:** `API_doc.md` documents no OTP verification/resend, workspace selection, logout/revocation, profile-update, or role/workspace response contract. Password-reset delivery, Google OAuth, server authorization, and production session security also remain unavailable.
- **Flow problems found:** The latest audit found no OTP expiry/resend and a read-only demo profile. Earlier issues included reversed auth hierarchy, developer copy, invalid mock behavior, role dead ends, and missing guards.
- **Changes made:** Added persisted demo OTP expiry and resend using the existing OTP fixture/registration state; blocked expired verification; added shared success feedback; added View → Edit → Save/Cancel profile behavior for demo/bypass sessions; preserved profile edits in the existing auth session; displayed workspace/role; kept API mode read-only rather than inventing an endpoint; and retained all previous auth layout, guard, role-routing, and API-contract fixes.
- **Remaining work:** Backend owners must document the missing contracts before API integration can expand. Production must replace browser token/session storage and client-only authorization. These are backend/security dependencies, not incomplete frontend mock flows.

### 02 — Create Course / Course Configuration

- **Requirement IDs:** 02
- **Current routes:** `/creator/courses/new/basics`, `/audience`, `/objectives`, `/certificate`, `/review`.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** Five-step wizard; course name/description; target learner; Beginner/Intermediate/Advanced; multiple objectives; certificate toggle and criteria; persistent values; Back; Continue; Save & exit; review; Edit links; final source handoff.
- **Missing behavior:** Backend draft records, per-course persistence, collaborative editing, and true autosave status.
- **Flow problems found:** Only course name controlled Continue; empty descriptions, audiences, or objectives could be skipped; disabled action did not explain all dependencies; nonfunctional drag affordance implied objective reordering.
- **Changes made:** Added step-specific and full-review validation, accessible guidance, disabled-reason messaging, length limits, Save & exit success feedback, removed the false reorder affordance, and routed submission through a mode-aware service so demo mode never requires course APIs.
- **Remaining work:** Bind wizard state to real course IDs and backend drafts.

### 03 — Knowledge Upload

- **Requirement IDs:** 03
- **Current routes:** `/creator/courses/digital-marketing-foundations/sources`.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** PDF/document/slide file selection and drag/drop; multi-file batch validation (maximum 10 uploaded files per course and 25 MB per file); upload progress; processing; ready; failure; retry; URL validation with multiple URL support and duplicate prevention; mock fetch/preview/error; delete confirmation; empty state; persistent mock sources; explicit AI readiness rule.
- **Missing behavior:** Real storage, parsing, virus scanning, URL retrieval, extraction details, and backend persistence.
- **Flow problems found:** File batches could be partially accepted; the file count limit was not enforced; URL duplicates were possible; source state reset on reload; AI dependency could be bypassed by manually opening analysis after deleting sources.
- **Changes made:** Added centralized file-count/size limits, whole-batch validation, explicit upload capacity guidance, multiple URL entry with validation and duplicate prevention, source persistence, success feedback, retry behavior, disabled reason, cross-route ready-source guard, and mode-aware separation between slug-based local sources and numeric API documents.
- **Remaining work:** Replace simulated timers and local data with upload/processing services.

### 04 — AI Knowledge Processing

- **Requirement IDs:** 04
- **Current routes:** `/creator/courses/digital-marketing-foundations/analysis`; failure-state QA route adds `?state=failed`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Reading, topic extraction, concept summarization, relationship mapping, sequencing, grounded-context retrieval, source linking, partial progress, failure/retry, completion, topic/concept inspection, reference drawer, relationship chain, recommended order, source review, and generation handoff.
- **Missing behavior:** Real AI/RAG execution, creator edits to analysis, accepting/rejecting topics, and persistence of analysis output.
- **Flow problems found:** No failure or retry state; direct analysis ignored deleted sources; pipeline omitted an explicit grounded-retrieval stage; unknown course IDs rendered product UI.
- **Changes made:** Added missing-source guard, failure/retry state, grounded retrieval step, dynamic entity validation, accessible reference drawer behavior, and clearer intentional generation CTA.
- **Remaining work:** Connect source-aware analysis output and approval/editing services. Full generated-content editing belongs to Function 06 after generation.

### 05 — AI Course Generator

- **Requirement IDs:** 05
- **Current routes:** `/creator/courses/[courseId]/generate`, `/generated`; failure QA uses `?state=failed` on Generate.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Readiness summary; source/topic/objective/audience/level context; seven understandable generation stages; failure/retry; structured outline, modules, lessons, objectives, exercises, Creator quizzes, practical task, rubric, final assessment, grounding, persisted result, and Review handoff.
- **Missing behavior:** Real generation request/polling, RAG/LLM output, backend status, and server persistence.
- **Flow problems found:** The earlier route was a terminal placeholder and generated no reviewable content.
- **Changes made:** Replaced the placeholder with a guarded, staged generator and generated-course workspace. Analysis completion and ready sources are prerequisites. No Publish action is exposed.
- **Remaining work:** Product/design acceptance and later integration with documented Generate, Generation Status, and Modules endpoints.

### 06 — Creator Review / Human Verification

- **Requirement IDs:** 06
- **Current routes:** `/creator/courses/[courseId]/review`.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** Responsive course tree, selected-content inspection, source traceability, focused edit mode, Save/Cancel, content validation, unsaved-change confirmation within review controls, Not reviewed/In review/Verified/Needs changes states, per-item verification, persisted edits/statuses, progress, review-complete handoff, and Preview-before-complete support.
- **Missing behavior:** Backend saves/verification, collaboration, comments, assignments, version history, and server audit trail.
- **Flow problems found:** Generated content previously had no review destination or quality-control interaction.
- **Changes made:** Added editable Human Verification. Editing a Verified item returns it to Needs changes, and Publish readiness requires all required items Verified.
- **Remaining work:** Product/design acceptance and later module/lesson update plus course-verify integration.

### 07 — Course Preview & Publishing

- **Requirement IDs:** 07
- **Current routes:** `/creator/courses/[courseId]/preview`, `/published`; publish failure QA uses `?state=failed` on Preview.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Responsive learner preview, expandable modules/lessons, activity/assessment/certificate visibility, Draft/Review/Published/Unpublished model, reusable readiness checks, explicit disabled reasons, confirmation, Publishing state, failure/retry, success, view/copy/My Courses actions, Unpublish confirmation, preserved content, republish, and dynamic My Courses status/action.
- **Missing behavior:** Backend Publish, public learner URL/access, real Unpublish endpoint, distribution, enrollment, and server lifecycle authority.
- **Flow problems found:** No learner-perspective preview, readiness model, or lifecycle management existed.
- **Changes made:** Added preview/publish lifecycle while enforcing Generate → Review → Verify → Preview → Publish. Preview is allowed early; Publish is not.
- **Remaining work:** Product/design acceptance and later integration with Verify/Publish plus a newly documented Unpublish contract.

### 08 — Learning Goal & Learning Style

- **Requirement IDs:** 08
- **Current routes:** `/learner`, `/learner/courses/[courseId]/learning-profile`; `/learner/onboarding` redirects to the workspace.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** Minimal Learner workspace; explicit Published-course start; one primary goal plus optional Other/detail; familiarity; multi-select content preferences; required pace; optional session length; inline validation; per-learner/course local persistence; editable return state; Function 08 preview handoff; and Function 09 navigation.
- **Missing behavior:** Backend profile API, enrollment/catalog authority, server persistence, and a documented server-side personalization-input contract.
- **Flow problems found:** Learner selection previously ended at a placeholder and collected none of the context required before assessment.
- **Changes made:** Added a role-separated Learner shell, course entry, complete Function 08 form/state, and a valid pre-assessment destination.
- **Remaining work:** Product/accessibility acceptance and future API integration. Self-reported familiarity must remain contextual and never replace assessment evidence.

### 09 — Pre-Assessment

- **Requirement IDs:** 09
- **Current routes:** `/learner/courses/[courseId]/pre-assessment`; bypass previews use `?view=intro`, `question`, or `processing`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Course-aware intro; eight typed multiple-choice/multiple-select questions; one-question navigation; autosaved responses/index; inline unanswered validation; compact answer review; submission confirmation; meaningful four-stage evaluation; deterministic question, skill, and overall scoring.
- **Missing behavior:** Backend attempt authority, randomized banks, server grading, and formal timing rules.
- **Flow problems found:** The earlier Function 08 handoff stopped at a placeholder and could not produce assessment evidence.
- **Changes made:** Connected Function 08 to a complete local attempt and result flow. Correct answers remain unavailable until after submission, and the result clears any obsolete path when the learner retakes the assessment.
- **Remaining work:** Product/accessibility acceptance and a fully documented backend pre-test schema.

### 10 — Skill Gap Analysis

- **Requirement IDs:** 10
- **Current routes:** `/learner/courses/[courseId]/skill-gap`, `/skill-gap/review`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Constructive overall readiness; per-competency score, progress, and text status; centralized 0–39/40–59/60–79/80–100 bands; the three lowest below-60 priority gaps; strengths; learner-friendly rationale; and read-only submitted-answer review.
- **Missing behavior:** Backend-verified scores, normative benchmarks, creator feedback, and configurable course-specific weights.
- **Flow problems found:** No evidence-based learner result existed between assessment and path generation.
- **Changes made:** Added deterministic aggregation outside JSX and gated the result on a completed pre-assessment outside bypass mode.
- **Remaining work:** Validate scoring policy with learning design stakeholders and connect a documented result contract.

### 11 — Personalized / Adaptive Learning Path

- **Requirement IDs:** 11
- **Current routes:** `/learner/courses/[courseId]/learning-path`; Function 12 entry at `/learn`; bypass previews use `?view=generating`, `result`, or `?state=failed`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Assessment-gated five-stage generation; priority/recommended/quick-refresher ordering; learner-facing reasons; activity selection influenced by content preferences; pace-adjusted estimates; path version, timestamp, and source-assessment evidence; failure/retry; persisted result. Assessment provenance is shown without exposing internal attempt identifiers.
- **Missing behavior:** Backend generation, live adaptation after later results, and server enrollment/prerequisite rules.
- **Flow problems found:** No path could consume Function 08 context or Function 09 evidence.
- **Changes made:** Added a pure mock generator that increases support for weak skills, keeps strong required topics as concise refreshers, and refuses to generate without required dependencies outside bypass mode.
- **Remaining work:** Product acceptance and backend ordering/generation contract.

### 12 — Learning Experience

- **Requirement IDs:** 12
- **Current routes:** `/learner/courses/[courseId]/learn`, `/learn/[lessonId]`.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** Personalized-order lessons, compact responsive navigation, objective/explanation/concepts/example/source/practice content, visible preferred activity formats, explicit completion followed by an intentional Next action, current position, completed count/course progress, refresh resume, text navigation states, unavailable-item recovery, and quick-check handoff.
- **Missing behavior:** Backend progress, enrollment authority, prerequisites, rich media, offline sync, and optional/mandatory policy configuration.
- **Flow problems found:** Function 11 previously ended at a placeholder and Learner Home could not resume lesson progress.
- **Changes made:** Replaced the placeholder with a progress-aware learning workspace and updated Home to resolve the latest stage. The flow audit also fixed premature visual advancement after completion and added direct completed/missing-lesson previews.
- **Remaining work:** Product/mobile acceptance and backend learning-progress contracts.

### 13 — Quiz / Post-Assessment

- **Requirement IDs:** 13
- **Current routes:** `/learner/courses/[courseId]/quiz/[quizId]`, `/post-assessment`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** One-question navigation, MCQ/multi-select, autosaved attempt, unanswered validation, quick feedback, exact-answer count, quick quiz, eight-question Post-Assessment, persisted staged analysis, centralized 60%/70% criteria, pass/needs-practice states, retry, and pre/post skill comparison.
- **Missing behavior:** Backend question bank/grading, enforced timer, attempt policy, and course-authored configuration.
- **Flow problems found:** Learning completion produced no post-learning evidence or improvement comparison.
- **Changes made:** Added a reusable knowledge-check workspace and scoring engine separate from Pre-Assessment state. Post-Assessment now persists an evaluating state and communicates comparison/criteria analysis before showing the result.
- **Remaining work:** Product acceptance and documented attempt/submission/result APIs.

### 14 — Practical Assessment & Submission

- **Requirement IDs:** 14
- **Current routes:** `/learner/courses/[courseId]/practical-assessment`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Visible task brief/outcome/time/requirements, five structured response fields, learner-friendly weighted rubric, validation, Save draft, submission confirmation, staged evaluation, passing and needs-practice results, criterion plus strongest/improvement feedback, evidence summary, and retry.
- **Missing behavior:** Real file evidence, backend AI/SME grading, creator review, resubmission history, and server storage.
- **Flow problems found:** Knowledge score alone could not demonstrate applied competency.
- **Changes made:** Added deterministic frontend evaluation and persisted draft/submission/result states behind the shared service boundary. Task, saved-draft, evaluating, pass, and needs-practice states now have deterministic bypass previews.
- **Remaining work:** Product acceptance plus secure submission and reviewer APIs.

### 15 — Skill Result & Feedback

- **Requirement IDs:** 15
- **Current routes:** `/learner/courses/[courseId]/result`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Overall competency score, pre/post improvement, skill-level comparison, practical score/evidence, concise strengths/improvements/next steps, directly previewable Completed/More practice status, and centralized Verified eligibility.
- **Missing behavior:** Backend competency authority, reviewer verification, standardized scoring, and credential issuance.
- **Flow problems found:** No single outcome combined lesson completion, knowledge, and applied evidence.
- **Changes made:** Added one result engine and completion checklist outside JSX; quiz score alone cannot mark a skill Verified.
- **Remaining work:** Product acceptance and backend result authority.

### 16 — Skill Evidence / Portfolio / Credential

- **Requirement IDs:** 16
- **Current routes:** `/learner/courses/[courseId]/skill-evidence`, `/skill-evidence/skills/[skillId]`, `/skill-evidence/requirements`, `/skill-evidence/credentials/[credentialId]`.
- **Current status:** Implemented (frontend simulation).
- **Implemented behavior:** Portfolio overview/skills/evidence/credentials sections; derived counts; per-skill competency, improvement, status, evidence count, and verification reason; assessment and learning result traceability; practical rubric evidence; evidence timeline; credential eligibility checklist; Not eligible/Eligible/Issued architecture; explicit persisted demo claim/issuance; certificate-disabled state; frontend credential preview; copy feedback; browser print; empty/partial states; learner-home integration; and bypass fixtures.
- **Missing behavior:** Backend evidence authority, production issuance/revocation, public verification URLs, production PDF generation, external sharing, and multi-course aggregation beyond the seeded prototype.
- **Flow problems found:** The previous destination stopped at a placeholder; evidence existed in Functions 09–15 but was not mapped into a reusable learner record; no certificate setting or completion rule was applied to credential presentation; a course-level result could have implied that every skill was Verified; and meeting eligibility previously implied Issued without a learner claim action.
- **Changes made:** Replaced the placeholder with one coherent Result → Portfolio → Skill Detail → Requirements → Credential flow. Extended the existing Function 15 verification engine so individual skill verification also requires the per-skill Post-Assessment threshold and applied evidence. Credential eligibility now derives from the same completion checks plus verified evidence and the course certificate setting. Eligible and Issued are now distinct: explicit demo claiming persists an issuance record in the existing learner journey, and changed prerequisite evidence invalidates it.
- **Remaining work:** Product acceptance, backend-authoritative evidence/credential contracts, public verification security, and production download/sharing.

### 17 — Creator Dashboard & Analytics

- **Requirement IDs:** 17
- **Current routes:** `/creator`, `/creator/courses`, `/creator/analytics`, `/creator/analytics/[courseId]`.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** Creator overview KPIs and lifecycle counts; status-aware recent-course actions; course and time-range filters stored in the URL; active learners, starts, completions, completion rate, post-assessment, and Verified-skill KPIs; learner progression funnel; largest drop-off; published-course comparison; Pre/Post improvement and practical pass analytics; per-skill outcomes and deterministic attention rules; lesson/activity completion, quiz, and retry signals; explainable Creator insights; course detail; client-side CSV export; and explicit loading, error/retry, no-published-course, no-learner-activity, unknown-course, and non-published states.
- **Missing behavior:** Backend-authoritative enrollment/event aggregation, production analytics permissions, real-time data, server report generation, and multi-creator aggregation.
- **Flow problems found:** The route was a placeholder, Creator home had no performance summary, published courses had no analytics action, filters/export did not exist, and zero-data courses would otherwise have looked like poor performance.
- **Changes made:** Replaced the placeholder with a typed frontend analytics feature. Reused the existing course lifecycle taxonomy and learner assessment/skill concepts, connected the Creator home and My Courses, separated no activity from zero performance, and kept API mode safe because `API_doc.md` documents no analytics endpoint.
- **Remaining work:** Product acceptance and a documented backend analytics/event/report contract.

### 18 — Organization Workspace

- **Requirement IDs:** 18
- **Current routes:** `/organization`, `/organization/courses`, `/organization/courses/[courseId]`, `/organization/learners`, `/organization/learners/[learnerId]`, `/organization/skills`; `/organization/onboarding` redirects to the workspace.
- **Current status:** Implemented (frontend).
- **Implemented behavior:** Dedicated Organization shell; workspace identity/current-user context; Active Course, Active Learner, Completion, Verified Skill, and average-improvement summaries; lifecycle-aware course catalog; published course performance using the shared Function 17 funnel/assessment/skill/content components; fictional learning-only learner list/detail; aggregate skill coverage and attention rules; working course/status/time/learner/coverage filters; workspace access based on `workspaceType`; and explicit empty, no-activity, loading, error/retry, unknown-course, and unknown-learner states.
- **Missing behavior:** Backend-authoritative organization identity, membership, permissions, course association, learner participation, privacy policy, analytics aggregation, and assignment/invitation contracts. These are not documented in `API_doc.md`, so the frontend sends no guessed Organization request.
- **Flow problems found:** Organization authentication ended at a placeholder; no organization navigation, learning overview, course performance, learner outcomes, or aggregate skill outcomes were inspectable.
- **Changes made:** Replaced the placeholder with one learning-focused workspace. Reused the existing course lifecycle, Function 17 analytics types/derivation, and skill attention rules; preserved the seeded `workspaceType: organization` plus `roles: [creator]` model without creating an Organization backend role; and kept Creator editing/Admin/HR capabilities out of the workspace.
- **Remaining work:** Product acceptance and documented backend Organization, membership, authorization, analytics, and privacy contracts.

### 19 — Administrator

- **Requirement IDs:** 19
- **Current routes:** `/admin`, `/admin/users`, `/admin/users/[userId]`, `/admin/courses`, `/admin/courses/[courseId]`, and `/admin/activity`; development access is handed off through `/dev/frontend-preview/admin` only when bypass is enabled.
- **Current status:** Implemented (frontend oversight).
- **Implemented behavior:** Dedicated role-guarded Admin shell; derived platform metrics; searchable/filterable user/account/role/workspace overview and detail; lifecycle-aware course oversight; Published-course learning, assessment, skill, and content outcomes; deterministic account/course/organization activity with a working filter; sign out; and explicit empty, loading, error/retry, no-result, unknown-record, non-published, and no-activity states.
- **Missing behavior:** Backend-authoritative Admin login/session claims, authorization, platform user/course/activity resources, pagination/privacy rules, account/content mutation contracts, and security-grade audit logging.
- **Flow problems found:** Admin was correctly absent from self-selection but had no protected workspace or usable oversight journey.
- **Changes made:** Added read-only oversight using existing `UserRole`, `WorkspaceType`, course lifecycle, Organization ownership, and Function 17 analytics. A generic bypass Creator session cannot enter `/admin`; the development index creates an explicit allow-listed Admin preview session. No mutation or guessed API endpoint was added.
- **Remaining work:** Product acceptance plus documented server-issued Admin authorization and Admin resources. Frontend route guards are not a security boundary.

### 20 — Notifications / Reports / Supporting States

- **Requirement IDs:** 20
- **Current routes:** `/notifications`; `/creator/analytics`; `/organization/skills`; `/admin/courses`; `/dev/frontend-preview/supporting-states`; global Not Found recovery. State previews use documented query parameters only while bypass is enabled.
- **Current status:** Implemented (frontend supporting layer).
- **Implemented behavior:** Role-scoped notifications, unread count/filtering, mark-one/all-read persistence, valid navigation destinations, empty/loading/error/retry states, accessible shell badge, filtered Creator/Organization/Admin CSV exports, shared loading/error/empty/invalid primitives, shared toasts and confirmations, explained disabled controls, and global invalid-route recovery.
- **Missing behavior:** Backend notification delivery/read synchronization, push/email/SMS, server-generated reports, server-authoritative export data, and a documented backend failure taxonomy.
- **Flow problems found:** No notification center existed; reporting logic was isolated to Creator Analytics; simple loading/error/empty structures were repeated; there was no global product-friendly Not Found page.
- **Changes made:** Added a typed mock notification service and role-aware center, persisted read receipts in the existing browser prototype style, added a shared CSV utility and filtered Organization/Admin exports, consolidated safe state wrappers, retained process-specific staged progress, and added Function 20 preview coverage.
- **Remaining work:** Product acceptance plus documented notification/report authorization, pagination, retention, privacy, delivery, read-state, and export contracts. No undocumented API request was added.

## Creator End-to-End Flow

| Transition | Status | Audit result |
| --- | --- | --- |
| Authentication → Creator workspace | Working | Valid demo sign-in or Creator account selection sets mock role/session and routes to `/creator`. |
| Creator workspace → Course Configuration | Working | Home and My Courses provide real links to `/creator/courses/new/basics`. |
| Course Configuration → Knowledge Upload | Working | Review CTA is enabled only after all current required data is valid. |
| Knowledge Upload → AI Processing | Working | Requires at least one Ready source; direct-route bypass is guarded. |
| AI Processing → Completed Analysis | Working | Visible stages, failure/retry, and result inspection are connected. |
| Completed Analysis → AI Course Generator | Working | Analysis completion and a Ready source unlock the real generation entry. |
| AI Course Generator → Creator Review | Working | Staged mock generation persists a structured course and hands off to review. |
| Creator Review → Preview | Working | Editing, grounding, and item verification persist; Preview can open before completion. |
| Preview → Publish | Working | Publish remains disabled until all readiness rules and required verification pass. |
| Publish → Published / Unpublished | Working | Local publish, manage, unpublish, and republish lifecycle is connected. |
| Creator dashboard → Published course analytics | Working | Creator home and My Courses expose View analytics only for Published courses. |
| Analytics overview → Course performance | Working | Course/time filters update deterministic metrics and published courses open `/creator/analytics/[courseId]`. |
| Course performance → Assessment / Skill outcomes | Working | Funnel, assessment, skill, content, attention, and insight sections share the selected course and time range. |

## Learner End-to-End Flow

| Transition | Status |
| --- | --- |
| Authentication → Learner workspace | Working |
| Learner workspace → Select / Start course | Working |
| Start course → Learning Goal & Style | Working |
| Goal / Style → Pre-Assessment | Working |
| Pre-Assessment → Skill Gap | Working |
| Skill Gap → Personalized Path | Working |
| Personalized Path → Learning Experience | Working |
| Learning Experience → Quiz / Post-Assessment | Working |
| Post-Assessment → Practical Assessment | Working |
| Practical Assessment → Skill Result | Working |
| Skill Result → Portfolio / Credential | Working — evidence, eligibility, and credential preview flow connected |

A learning path is exposed only after assessment evidence. Verified requires completed learning plus passing knowledge, an individual skill threshold, and applied practical evidence. Credentials also require the course certificate setting. Issued credentials are clearly marked frontend demo records rather than public credentials.

## Role Flow

- **Learner:** Selectable at account type; routes to `/learner`; uses a learner-only shell and can complete Functions 08–16 without Creator navigation.
- **Creator:** Selectable; routes to `/creator`; current Creator functions 01–07 are available.
- **Organization:** Selectable; routes to `/organization`; uses a dedicated learning-focused shell. Access keys from `workspaceType: organization` while retaining the seeded `roles: [creator]` value; no Admin or Creator-editing capability is implied.
- **Admin:** Not selectable; `/admin` requires `roles: [admin]`. Bypass access is created only by the development preview handoff. Normal API access still requires future server-issued role/workspace claims and backend authorization.

## Organization End-to-End Flow

| Transition | Status | Audit result |
| --- | --- | --- |
| Authentication → Organization overview | Working | Organization demo/account-type access routes to `/organization`; wrong demo workspace redirects and bypass allows explicit direct preview. |
| Overview → Organization courses | Working | Summary metrics and course activity link to the lifecycle-aware catalog. |
| Courses → Course performance | Working | Published courses expose shared funnel, assessment, skill, and content analytics; no-activity and non-published courses receive explicit states. |
| Overview → Learners → Learner detail | Working | Course/status filters lead to fictional learning-only records with progress, completions, verified skills, and recent activity. |
| Overview → Skills & Outcomes | Working | Course/time/coverage filters update aggregate Pre/Post improvement, practical pass, retry, and attention signals. |

## Admin End-to-End Flow

| Transition | Status | Audit result |
| --- | --- | --- |
| Frontend Preview → Admin overview | Working in bypass only | An explicit allow-listed handoff seeds the system-assigned Admin role; a generic bypass session is rejected. |
| Overview → Users → User detail | Working | Search and account-type filters lead to read-only identity, workspace, role, and SkillSync activity context. |
| Overview → Courses → Course detail | Working | Existing lifecycle and owner data lead to read-only Published outcomes or clear non-published/no-activity states. |
| Overview → Platform activity | Working | Account, course, and Organization event categories filter deterministic oversight records. |
| Normal user → `/admin` | Working | Learner, Creator, and Organization sessions redirect to their own workspace; Admin is not self-selectable. |

## Route Audit

| Route | Entry | Primary action / success | Back destination | Failure state | Role | Dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Direct | Redirect to sign-in | — | — | Public | None |
| `/sign-in` | Root/logout | Any non-empty bypass credentials → Creator; workspace by fixture in demo; Creator in API mode | Create account | Empty bypass fields; fixture errors in demo; network/API errors only in API mode | Public | Central bypass/demo/API selection |
| `/create-account` | Sign-in | OTP in demo; sign-in notice in API mode | Sign-in | Field validation and mode-appropriate errors | Public | Demo temporary registration or backend registration |
| `/verify-otp` | Demo registration | Account type | Create account | Incomplete, invalid, expired, resend failure, or missing temporary registration; intentional API contract-gap state | Public | Persisted demo registration/expiry context; no documented API endpoint |
| `/account-type` | Verified demo OTP | Selected workspace | Verify OTP | Missing/unverified registration; intentional API contract-gap state | Public | Verified demo registration; no documented API endpoint |
| `/learner` | Learner auth | Start/continue Digital Marketing Foundations | Sign out | Missing/wrong-role demo session redirects | Learner | Demo/API/bypass session and mock course catalog |
| `/learner/onboarding` | Legacy learner URL | Redirect to `/learner` | — | — | Learner | None |
| `/learner/courses/[courseId]/learning-profile` | Start/continue course | Persist profile and open pre-assessment entry | Learner workspace | Unknown course 404; inline required-field/save errors | Learner | Valid mock course and learner session |
| `/learner/courses/[courseId]/pre-assessment` | Valid Function 08 submission or bypass preview | Submit and open Skill Gap | Learning profile | Missing profile, unanswered validation, unknown course | Learner | Valid course and learning profile; bypass may hydrate fixtures |
| `/learner/courses/[courseId]/skill-gap` | Completed assessment or bypass preview | Build learning path | Pre-assessment | Missing completed result | Learner | Completed assessment result |
| `/learner/courses/[courseId]/skill-gap/review` | Skill snapshot | Read-only answer review | Skill Gap | Missing completed result | Learner | Submitted answers and scoring result |
| `/learner/courses/[courseId]/learning-path` | Skill Gap CTA or bypass preview | Start learning handoff | Skill Gap | Missing profile/result; simulated generation failure/retry | Learner | Function 08 profile and completed Function 09 result |
| `/learner/courses/[courseId]/learn[/[lessonId]]` | Ready path/Home resume | Complete lesson; quick quiz/next lesson/Post-Assessment | Learning Path | Missing path or unavailable lesson | Learner | Personalized path; bypass fixture only in preview mode |
| `/learner/courses/[courseId]/quiz/[quizId]` | Related lesson | Feedback then continue learning | Source lesson | Missing lesson completion, unanswered question, unknown quiz | Learner | Related lesson complete |
| `/learner/courses/[courseId]/post-assessment` | All required lessons complete | Passed result → Practical Assessment | Learning Experience | Unanswered question, failing score/retry | Learner | Learning progress complete |
| `/learner/courses/[courseId]/practical-assessment` | Passing Post-Assessment | Passed evidence → Skill Result | Learning Experience | Validation, needs-practice result/retry | Learner | Passing Post-Assessment |
| `/learner/courses/[courseId]/result` | Evaluated practical | Skill Evidence handoff | Practical Assessment | Completion checklist not ready | Learner | Learning complete, post result, practical result/evidence |
| `/learner/courses/[courseId]/skill-evidence` | Skill Result/Learner Home | Portfolio sections, skill detail, credential requirements | Skill Result/Learner Home | Empty portfolio; incomplete evidence; unknown course | Learner | Persisted Function 09–15 evidence; bypass may hydrate consistent fixtures |
| `/learner/courses/[courseId]/skill-evidence/skills/[skillId]` | Portfolio Skills | Evidence result or next required assessment | Portfolio Skills | Unknown skill; partial/non-verified explanation | Learner | Derived skill evidence and existing verification engine |
| `/learner/courses/[courseId]/skill-evidence/requirements` | Credentials section | Credential preview or continue assessment | Credentials section | Not eligible; certificate not offered | Learner | Completion checks, verified evidence, certificate setting |
| `/learner/courses/[courseId]/skill-evidence/credentials/[credentialId]` | Issued/eligible credential card | Eligible → claim demo credential; Issued → evidence, copy, browser print | Portfolio Credentials | Unknown/unavailable credential; claim rejected when requirements fail or mock mode is off | Learner | Derived eligibility plus explicit persisted demo issuance; no public verification |
| `/organization/onboarding` | Legacy Organization URL | Redirect to `/organization` | — | Wrong workspace is handled by Organization shell | Organization | Existing Organization session |
| `/organization` | Organization auth/demo access | Courses, Learners, or Skills & Outcomes | — | Empty workspace; loading; API contract error/retry; wrong workspace redirect | Organization | `workspaceType: organization` or bypass; frontend fixtures |
| `/organization/courses` | Organization sidebar/overview | Filter and open organization course | Overview | No courses; no matching status; loading/error | Organization | Organization course association fixture and shared lifecycle |
| `/organization/courses/[courseId]` | Organization Courses | Inspect published learner/assessment/skill/content performance | Courses | Unknown course; non-published explanation; no learner activity; loading/error | Organization | Associated course plus shared Function 17 analytics fixture |
| `/organization/learners` | Organization sidebar/overview | Filter and open learner outcomes | Overview | No learners; no matching filters; loading/error | Organization | Fictional learning-only roster fixture |
| `/organization/learners/[learnerId]` | Organization Learners | Inspect current learning, completion, verified skills, and recent activity | Learners | Unknown learner; loading/error | Organization | Fictional learning-only learner record |
| `/organization/skills` | Organization sidebar/overview | Filter aggregate skill coverage and attention outcomes | Overview | No skill data; no matching filters; loading/error | Organization | Shared assessment/skill analytics and deterministic attention rules |
| `/admin` | Explicit bypass Admin preview or future server-authorized Admin session | Users, Courses, or Platform Activity | — | Empty platform; loading; API contract error/retry; non-Admin redirect | Admin | Existing session with `admin` role; frontend fixtures in bypass/demo only |
| `/admin/users` | Admin sidebar/overview | Search/filter and inspect user | Overview | No users; no filter results; loading/error | Admin | Admin user oversight fixture; existing role/workspace types |
| `/admin/users/[userId]` | Admin Users | Inspect identity, workspace, roles, and activity context | Users | Unknown user; loading/error | Admin | Existing Admin user record |
| `/admin/courses` | Admin sidebar/overview | Filter and inspect course | Overview | No courses; no lifecycle matches; loading/error | Admin | Shared lifecycle, ownership, and Function 17 analytics fixtures |
| `/admin/courses/[courseId]` | Admin Courses | Inspect ownership and learning outcomes | Courses | Unknown/non-published/no-activity course; loading/error | Admin | Shared course and analytics fixture; read-only |
| `/admin/activity` | Admin sidebar/overview | Filter recent oversight events | Overview | No activity/no matches; loading/error | Admin | Deterministic frontend activity fixture |
| `/dev/frontend-preview/admin` | Bypass-only preview index | Seed Admin preview role and redirect to allow-listed Admin destination | Preview index | Not Found when bypass is off; invalid destination falls back to `/admin` | Development | `NEXT_PUBLIC_FRONTEND_BYPASS=true` |
| `/notifications` | Authenticated shell badge/direct route | Filter All/Unread, mark read/all read, or open a valid product destination | Role workspace | Empty, loading, unavailable/retry; wrong/missing session redirects | Creator/Learner/Organization/Admin | Role-scoped frontend fixtures in mock mode; no documented API endpoint |
| `/creator` | Creator login/demo access | Create/continue course | — | Missing/wrong-role demo session redirects | Creator | Matching demo session or API session |
| `/creator/courses` | Sidebar/home | Create/manage documents | Creator home | Demo empty/local state or API loading/network errors | Creator | Mode-aware local list or `GET /api/courses` |
| `/creator/courses/new/[step]` | Create/Continue/Edit | Demo source workspace or backend course documents | Previous step/home | Validation and mode-appropriate create errors | Creator | Prior values; local demo submission or `POST /api/courses` on Review |
| `/creator/courses/[courseId]/sources` | Created/listed course | File upload/status/delete | My Courses | Upload/list/delete and mock URL/source failures | Creator | Local behavior for demo slug; documented APIs for numeric IDs in API mode |
| `/creator/courses/[courseId]/analysis` | Ready source CTA on seeded demo | AI Course Generator | Sources | Unknown course 404; missing-ready-source; simulated AI failure/retry | Authenticated prototype | Local mock sources; no documented analysis endpoint |
| `/creator/courses/[courseId]/generate` | Completed analysis | Generated course | Analysis | Missing source/analysis; generation failure/retry; unknown course | Creator | Persisted analysis completion and Ready source |
| `/creator/courses/[courseId]/generated` | Generation completion | Creator Review | Generate | Missing generated state; unknown course | Creator | Persisted generated course |
| `/creator/courses/[courseId]/review` | Generated result/My Courses | Preview | Generated course | Missing generated state; validation; unsaved changes | Creator | Generated course; per-item reviews |
| `/creator/courses/[courseId]/preview` | Review | Published success | Review | Not-ready checklist; publish failure/retry | Creator | Generated content, Ready source, full verification, certificate criteria |
| `/creator/courses/[courseId]/published` | Publish success/My Courses | Unpublish or My Courses | My Courses | Missing/non-published state | Creator | Published lifecycle state |
| `/creator/account` | Profile links | Demo/bypass Edit → Save/Cancel; confirmed sign out | Sidebar navigation | Inline validation/save errors; loading/current-user API error in API mode | Creator | Existing local session for edits; API mode uses read-only `GET /api/auth/me`; local session clear for logout |
| `/creator/analytics[/[courseId]]` | Sidebar/Published course | Filter or inspect course, assessment, skill, and content performance; CSV export | Creator/Courses | Empty, no learner activity, non-published, loading, error/retry | Creator | Function 17 frontend analytics fixtures; no documented backend endpoint |
| `/dev/frontend-preview/supporting-states` | Function 20 preview group | Inspect loading, empty, error/retry, confirmation, feedback, disabled, and invalid states | Preview index | Not Found when bypass is off | Development | `NEXT_PUBLIC_FRONTEND_BYPASS=true` |
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
- Function 05 ended at a placeholder, so generated content could not reach Human Verification.
- No persisted review status or readiness rule prevented an apparent Preview/Publish implementation from bypassing verification.
- Course cards could not reflect Review, Published, or Unpublished lifecycle state.
- Generated-course navigation expanded every module, repeated heavy card borders, consumed excessive height, and remained permanently visible on small screens.
- Learner authentication ended at a placeholder with no course start, learning context, persistence, or assessment handoff.
- Function 09 was only a placeholder, so no assessment evidence could feed Skill Gap or personalization.
- No centralized weak-topic/status thresholds, result review, or assessment-gated path generator existed.
- Learner Home always returned a learner with saved progress to Function 08 instead of their latest completed stage.
- Bypass Sign In still matched seeded credentials, contradicting true frontend access.
- Function 12 was a placeholder; no lesson completion, post-learning evidence, applied evidence, or final result existed.
- Function 16 stopped at a placeholder and did not connect saved evidence, per-skill verification, certificate settings, or credential eligibility.
- Standalone TypeScript relied on generated `LayoutProps`; temporary copy/success messages were duplicated; demo OTP had no expiry/resend; Creator profile was display-only.
- Organization authentication ended at a placeholder with no learning overview, course performance, learner outcomes, aggregate skills, or dedicated navigation.
- Admin was correctly system-only but had no protected oversight route, user/course inspection, or platform activity view.
- Supporting feedback existed, but there was no role-aware notification center, Organization/Admin export parity, reusable simple-state primitive, or global invalid-route recovery.

### Resolution

- Rebalanced blue-left/white-right authentication layout with a compact mobile hierarchy.
- Removed development copy and links from product routes.
- Added deterministic demo validation, errors, success, loading, OTP, and retry states behind one environment switch.
- Added direct demo access, role-specific future placeholders, refresh-safe sessions, role routing, and logout.
- Added editable profile fields and save/logout feedback.
- Added a shared application toast provider, consolidated common temporary feedback, strengthened and reused the shared confirmation dialog, removed the generated-layout-type dependency, and completed demo OTP expiry/resend plus persisted profile editing.
- Added wizard validation and disabled-reason text for every step.
- Removed the unsupported reorder affordance.
- Added file/text/URL validation and explicit recovery actions.
- Persisted mock sources and enforced the Ready-source dependency on both CTA and destination.
- Added AI failure/retry and missing-source states.
- Added route-entity/dependency 404 checks.
- Improved dialog semantics, initial focus, Escape close, and background scroll handling.
- Added a real Create course link to the empty-state card.
- Preserved documented API calls behind the same mode-aware services, without scattering environment checks through UI components.
- Added guarded generation, persisted generated content, source-grounded Human Verification, and explicit per-item review status.
- Added one reusable readiness model that blocks Publish until configuration, sources, content, review, verification, and certificate rules pass.
- Added local publish/unpublish lifecycle and status-appropriate My Courses actions without claiming backend publication.
- Replaced heavy generated-course module cards with a compact collapsible tree, active-module expansion, viewport-bounded sticky scrolling, two-line labels, and a mobile structure drawer.
- Added the role-separated Learner workspace and persisted Function 08 flow into Function 09.
- Replaced the Function 09 placeholder with a resumable eight-question assessment, inline validation, submission review, staged evaluation, and persisted scoring.
- Added centralized competency bands, priority gaps, strengths, and post-submission answer explanations.
- Added dependency-gated path generation that uses both assessment evidence and Function 08 preferences, plus failure/retry, path evidence/versioning, and an intentional Function 12 handoff.
- Made the Learner Home Continue action resolve from saved profile, assessment, result, and path state.
- Made bypass Sign In accept any non-empty credentials into a Creator preview session before any fixture or API logic; normal demo/API branches remain intact.
- Added personalized lesson delivery, saved completion/resume, quick checks, Post-Assessment, practical draft/evaluation, and completion-gated Skill Result.
- Replaced the Function 16 placeholder with a derived portfolio, skill evidence mapping, incomplete/Verified explanations, credential requirements, simulated issued/eligible states, safe sharing feedback, and browser print.
- Replaced the Organization placeholder with a workspace-scoped shell, lifecycle-aware courses, shared Function 17 course analytics, fictional learning-only learner records, aggregate skill outcomes, working filters, and explicit no-data/recovery states.
- Added a role-guarded, read-only Admin workspace for user/account/role/workspace, course lifecycle/outcome, and lightweight activity oversight; bypass entry is explicit and no Admin API or mutation is guessed.
- Added role-aware notifications with persisted read state and valid destinations; consolidated simple loading/error/empty/invalid states; shared filtered CSV export across Creator, Organization, and Admin; and added a product-friendly global Not Found recovery.

## Business Rule Integrity

1. Mock role access routes Creator, Learner, and Organization to different areas; Admin is never self-selectable.
2. Generated content cannot publish until every required item is verified and all readiness rules pass.
3. Analysis and generated content expose mock source names, locations, excerpts, and reference counts through one shared drawer.
4. Personalized learning cannot generate without a completed pre-assessment outside bypass preview mode.
5. Weak topics use the centralized below-60% threshold; visible status bands remain separately centralized.
6. Paths record assessment evidence and a version for future adaptation; live adaptation is not claimed.
7. Verified requires lesson completion, a passing Post-Assessment, a passing Practical Assessment, captured practical evidence, and the individual skill threshold.
8. Quick quiz, Post-Assessment, and Practical Assessment use centralized passing criteria; opening a screen never passes it.
9. A frontend demo credential is shown as issued only when completion, assessment, applied evidence, per-skill verification, and certificate-setting requirements pass; it is explicitly not a public credential.
10. Certificate criteria are shown whenever enabled and are included in publish readiness.
11. Admin remains excluded from registration and Account Type; a generic bypass session cannot enter Admin, and frontend guards are documented as insufficient without backend authorization.
12. Notification audiences derive from the existing role/workspace session model, and every notification destination resolves to an implemented route.
13. Reports export the currently filtered frontend analytics view and never claim server authority or create an undocumented API request.
