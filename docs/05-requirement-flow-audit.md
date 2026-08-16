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
- **Current routes:** `/`, `/sign-in`, `/create-account`, `/verify-otp`, `/account-type`, `/creator/account`, `/learner`, `/learner/onboarding` (redirect), `/organization/onboarding`.
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
- **Current routes:** `/creator/courses/[courseId]/generate`, `/generated`; failure QA uses `?state=failed` on Generate.
- **Current status:** Needs Review.
- **Implemented behavior:** Readiness summary; source/topic/objective/audience/level context; seven understandable generation stages; failure/retry; structured outline, modules, lessons, objectives, exercises, Creator quizzes, practical task, rubric, final assessment, grounding, persisted result, and Review handoff.
- **Missing behavior:** Real generation request/polling, RAG/LLM output, backend status, and server persistence.
- **Flow problems found:** The earlier route was a terminal placeholder and generated no reviewable content.
- **Changes made:** Replaced the placeholder with a guarded, staged generator and generated-course workspace. Analysis completion and ready sources are prerequisites. No Publish action is exposed.
- **Remaining work:** Product/design acceptance and later integration with documented Generate, Generation Status, and Modules endpoints.

### 06 — Creator Review / Human Verification

- **Requirement IDs:** 06
- **Current routes:** `/creator/courses/[courseId]/review`.
- **Current status:** Needs Review.
- **Implemented behavior:** Responsive course tree, selected-content inspection, source traceability, focused edit mode, Save/Cancel, content validation, unsaved-change confirmation within review controls, Not reviewed/In review/Verified/Needs changes states, per-item verification, persisted edits/statuses, progress, review-complete handoff, and Preview-before-complete support.
- **Missing behavior:** Backend saves/verification, collaboration, comments, assignments, version history, and server audit trail.
- **Flow problems found:** Generated content previously had no review destination or quality-control interaction.
- **Changes made:** Added editable Human Verification. Editing a Verified item returns it to Needs changes, and Publish readiness requires all required items Verified.
- **Remaining work:** Product/design acceptance and later module/lesson update plus course-verify integration.

### 07 — Course Preview & Publishing

- **Requirement IDs:** 07
- **Current routes:** `/creator/courses/[courseId]/preview`, `/published`; publish failure QA uses `?state=failed` on Preview.
- **Current status:** Needs Review.
- **Implemented behavior:** Responsive learner preview, expandable modules/lessons, activity/assessment/certificate visibility, Draft/Review/Published/Unpublished model, reusable readiness checks, explicit disabled reasons, confirmation, Publishing state, failure/retry, success, view/copy/My Courses actions, Unpublish confirmation, preserved content, republish, and dynamic My Courses status/action.
- **Missing behavior:** Backend Publish, public learner URL/access, real Unpublish endpoint, distribution, enrollment, and server lifecycle authority.
- **Flow problems found:** No learner-perspective preview, readiness model, or lifecycle management existed.
- **Changes made:** Added preview/publish lifecycle while enforcing Generate → Review → Verify → Preview → Publish. Preview is allowed early; Publish is not.
- **Remaining work:** Product/design acceptance and later integration with Verify/Publish plus a newly documented Unpublish contract.

### 08 — Learning Goal & Learning Style

- **Requirement IDs:** 08
- **Current routes:** `/learner`, `/learner/courses/[courseId]/learning-profile`; `/learner/onboarding` redirects to the workspace.
- **Current status:** Needs Review.
- **Implemented behavior:** Minimal Learner workspace; explicit Published-course start; one primary goal plus optional Other/detail; familiarity; multi-select content preferences; required pace; optional session length; inline validation; per-learner/course local persistence; editable return state; Function 08 preview handoff; and Function 09 navigation.
- **Missing behavior:** Backend profile API, enrollment/catalog authority, server persistence, and a documented server-side personalization-input contract.
- **Flow problems found:** Learner selection previously ended at a placeholder and collected none of the context required before assessment.
- **Changes made:** Added a role-separated Learner shell, course entry, complete Function 08 form/state, and a valid pre-assessment destination.
- **Remaining work:** Product/accessibility acceptance and future API integration. Self-reported familiarity must remain contextual and never replace assessment evidence.

### 09 — Pre-Assessment

- **Requirement IDs:** 09
- **Current routes:** `/learner/courses/[courseId]/pre-assessment`; bypass previews use `?view=intro`, `question`, or `processing`.
- **Current status:** Needs Review.
- **Implemented behavior:** Course-aware intro; eight typed multiple-choice/multiple-select questions; one-question navigation; autosaved responses/index; inline unanswered validation; compact answer review; submission confirmation; meaningful four-stage evaluation; deterministic question, skill, and overall scoring.
- **Missing behavior:** Backend attempt authority, randomized banks, server grading, and formal timing rules.
- **Flow problems found:** The earlier Function 08 handoff stopped at a placeholder and could not produce assessment evidence.
- **Changes made:** Connected Function 08 to a complete local attempt and result flow. Correct answers remain unavailable until after submission, and the result clears any obsolete path when the learner retakes the assessment.
- **Remaining work:** Product/accessibility acceptance and a fully documented backend pre-test schema.

### 10 — Skill Gap Analysis

- **Requirement IDs:** 10
- **Current routes:** `/learner/courses/[courseId]/skill-gap`, `/skill-gap/review`.
- **Current status:** Needs Review.
- **Implemented behavior:** Constructive overall readiness; per-competency score, progress, and text status; centralized 0–39/40–59/60–79/80–100 bands; the three lowest below-60 priority gaps; strengths; learner-friendly rationale; and read-only submitted-answer review.
- **Missing behavior:** Backend-verified scores, normative benchmarks, creator feedback, and configurable course-specific weights.
- **Flow problems found:** No evidence-based learner result existed between assessment and path generation.
- **Changes made:** Added deterministic aggregation outside JSX and gated the result on a completed pre-assessment outside bypass mode.
- **Remaining work:** Validate scoring policy with learning design stakeholders and connect a documented result contract.

### 11 — Personalized / Adaptive Learning Path

- **Requirement IDs:** 11
- **Current routes:** `/learner/courses/[courseId]/learning-path`; Function 12 entry at `/learn`; bypass previews use `?view=generating`, `result`, or `?state=failed`.
- **Current status:** Needs Review.
- **Implemented behavior:** Assessment-gated five-stage generation; priority/recommended/quick-refresher ordering; learner-facing reasons; activity selection influenced by content preferences; pace-adjusted estimates; path version, timestamp, and source-assessment evidence; failure/retry; persisted result. Assessment provenance is shown without exposing internal attempt identifiers.
- **Missing behavior:** Backend generation, live adaptation after later results, and server enrollment/prerequisite rules.
- **Flow problems found:** No path could consume Function 08 context or Function 09 evidence.
- **Changes made:** Added a pure mock generator that increases support for weak skills, keeps strong required topics as concise refreshers, and refuses to generate without required dependencies outside bypass mode.
- **Remaining work:** Product acceptance and backend ordering/generation contract.

### 12 — Learning Experience

- **Requirement IDs:** 12
- **Current routes:** `/learner/courses/[courseId]/learn`, `/learn/[lessonId]`.
- **Current status:** Needs Review.
- **Implemented behavior:** Personalized-order lessons, compact responsive navigation, objective/explanation/concepts/example/source/practice content, visible preferred activity formats, explicit completion followed by an intentional Next action, current position, completed count/course progress, refresh resume, text navigation states, unavailable-item recovery, and quick-check handoff.
- **Missing behavior:** Backend progress, enrollment authority, prerequisites, rich media, offline sync, and optional/mandatory policy configuration.
- **Flow problems found:** Function 11 previously ended at a placeholder and Learner Home could not resume lesson progress.
- **Changes made:** Replaced the placeholder with a progress-aware learning workspace and updated Home to resolve the latest stage. The flow audit also fixed premature visual advancement after completion and added direct completed/missing-lesson previews.
- **Remaining work:** Product/mobile acceptance and backend learning-progress contracts.

### 13 — Quiz / Post-Assessment

- **Requirement IDs:** 13
- **Current routes:** `/learner/courses/[courseId]/quiz/[quizId]`, `/post-assessment`.
- **Current status:** Needs Review.
- **Implemented behavior:** One-question navigation, MCQ/multi-select, autosaved attempt, unanswered validation, quick feedback, exact-answer count, quick quiz, eight-question Post-Assessment, persisted staged analysis, centralized 60%/70% criteria, pass/needs-practice states, retry, and pre/post skill comparison.
- **Missing behavior:** Backend question bank/grading, enforced timer, attempt policy, and course-authored configuration.
- **Flow problems found:** Learning completion produced no post-learning evidence or improvement comparison.
- **Changes made:** Added a reusable knowledge-check workspace and scoring engine separate from Pre-Assessment state. Post-Assessment now persists an evaluating state and communicates comparison/criteria analysis before showing the result.
- **Remaining work:** Product acceptance and documented attempt/submission/result APIs.

### 14 — Practical Assessment & Submission

- **Requirement IDs:** 14
- **Current routes:** `/learner/courses/[courseId]/practical-assessment`.
- **Current status:** Needs Review.
- **Implemented behavior:** Visible task brief/outcome/time/requirements, five structured response fields, learner-friendly weighted rubric, validation, Save draft, submission confirmation, staged evaluation, passing and needs-practice results, criterion plus strongest/improvement feedback, evidence summary, and retry.
- **Missing behavior:** Real file evidence, backend AI/SME grading, creator review, resubmission history, and server storage.
- **Flow problems found:** Knowledge score alone could not demonstrate applied competency.
- **Changes made:** Added deterministic frontend evaluation and persisted draft/submission/result states behind the shared service boundary. Task, saved-draft, evaluating, pass, and needs-practice states now have deterministic bypass previews.
- **Remaining work:** Product acceptance plus secure submission and reviewer APIs.

### 15 — Skill Result & Feedback

- **Requirement IDs:** 15
- **Current routes:** `/learner/courses/[courseId]/result`.
- **Current status:** Needs Review.
- **Implemented behavior:** Overall competency score, pre/post improvement, skill-level comparison, practical score/evidence, concise strengths/improvements/next steps, directly previewable Completed/More practice status, and centralized Verified eligibility.
- **Missing behavior:** Backend competency authority, reviewer verification, standardized scoring, and credential issuance.
- **Flow problems found:** No single outcome combined lesson completion, knowledge, and applied evidence.
- **Changes made:** Added one result engine and completion checklist outside JSX; quiz score alone cannot mark a skill Verified.
- **Remaining work:** Product acceptance and backend result authority.

### 16 — Skill Evidence / Portfolio / Credential

- **Requirement IDs:** 16
- **Current routes:** `/learner/courses/[courseId]/skill-evidence`, `/skill-evidence/skills/[skillId]`, `/skill-evidence/requirements`, `/skill-evidence/credentials/[credentialId]`.
- **Current status:** Needs Review.
- **Implemented behavior:** Portfolio overview/skills/evidence/credentials sections; derived counts; per-skill competency, improvement, status, evidence count, and verification reason; assessment and learning result traceability; practical rubric evidence; evidence timeline; credential eligibility checklist; Not eligible/Eligible/Issued architecture; explicit persisted demo claim/issuance; certificate-disabled state; frontend credential preview; copy feedback; browser print; empty/partial states; learner-home integration; and bypass fixtures.
- **Missing behavior:** Backend evidence authority, production issuance/revocation, public verification URLs, production PDF generation, external sharing, and multi-course aggregation beyond the seeded prototype.
- **Flow problems found:** The previous destination stopped at a placeholder; evidence existed in Functions 09–15 but was not mapped into a reusable learner record; no certificate setting or completion rule was applied to credential presentation; a course-level result could have implied that every skill was Verified; and meeting eligibility previously implied Issued without a learner claim action.
- **Changes made:** Replaced the placeholder with one coherent Result → Portfolio → Skill Detail → Requirements → Credential flow. Extended the existing Function 15 verification engine so individual skill verification also requires the per-skill Post-Assessment threshold and applied evidence. Credential eligibility now derives from the same completion checks plus verified evidence and the course certificate setting. Eligible and Issued are now distinct: explicit demo claiming persists an issuance record in the existing learner journey, and changed prerequisite evidence invalidates it.
- **Remaining work:** Product acceptance, backend-authoritative evidence/credential contracts, public verification security, and production download/sharing.

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
| Completed Analysis → AI Course Generator | Working | Analysis completion and a Ready source unlock the real generation entry. |
| AI Course Generator → Creator Review | Needs Review | Staged mock generation persists a structured course and hands off to review. |
| Creator Review → Preview | Needs Review | Editing, grounding, and item verification persist; Preview can open before completion. |
| Preview → Publish | Needs Review | Publish remains disabled until all readiness rules and required verification pass. |
| Publish → Published / Unpublished | Needs Review | Local publish, manage, unpublish, and republish lifecycle is connected. |

## Learner End-to-End Flow

| Transition | Status |
| --- | --- |
| Authentication → Learner workspace | Working |
| Learner workspace → Select / Start course | Working |
| Start course → Learning Goal & Style | Working |
| Goal / Style → Pre-Assessment | Needs Review |
| Pre-Assessment → Skill Gap | Needs Review |
| Skill Gap → Personalized Path | Needs Review |
| Personalized Path → Learning Experience | Needs Review |
| Learning Experience → Quiz / Post-Assessment | Needs Review |
| Post-Assessment → Practical Assessment | Needs Review |
| Practical Assessment → Skill Result | Needs Review |
| Skill Result → Portfolio / Credential | Needs Review — evidence, eligibility, and credential preview flow connected |

A learning path is exposed only after assessment evidence. Verified requires completed learning plus passing knowledge, an individual skill threshold, and applied practical evidence. Credentials also require the course certificate setting. Issued credentials are clearly marked frontend demo records rather than public credentials.

## Role Flow

- **Learner:** Selectable at account type; routes to `/learner`; uses a learner-only shell and can complete Functions 08–16 without Creator navigation.
- **Creator:** Selectable; routes to `/creator`; current Creator functions 01–07 are available.
- **Organization:** Selectable; routes to `/organization/onboarding`; cannot enter Creator/Admin functionality.
- **Admin:** Not selectable; no route exists; future access must be system-assigned and server-authorized.

## Route Audit

| Route | Entry | Primary action / success | Back destination | Failure state | Role | Dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Direct | Redirect to sign-in | — | — | Public | None |
| `/sign-in` | Root/logout | Any non-empty bypass credentials → Creator; workspace by fixture in demo; Creator in API mode | Create account | Empty bypass fields; fixture errors in demo; network/API errors only in API mode | Public | Central bypass/demo/API selection |
| `/create-account` | Sign-in | OTP in demo; sign-in notice in API mode | Sign-in | Field validation and mode-appropriate errors | Public | Demo temporary registration or backend registration |
| `/verify-otp` | Demo registration | Account type | Create account | Incomplete/invalid OTP or missing temporary registration; intentional API contract-gap state | Public | Demo registration context; no documented API endpoint |
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
| `/organization/onboarding` | Organization auth | Sign out | — | Wrong role redirects; future placeholder | Demo Organization | Organization demo session |
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
