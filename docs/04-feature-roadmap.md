# SkillSync AI feature roadmap

Status reflects whether a complete frontend user goal can be achieved—not whether a route or static placeholder exists.

| ID | Feature | Status | Current scope |
| --- | --- | --- | --- |
| 00 | Design Foundation | Implemented | Core tokens and reusable controls now include application-level success/error/information toasts plus one focus-managed confirmation dialog used by publish, unpublish, source deletion, review, and assessment flows. Standalone TypeScript, lint, and production build checks pass. |
| 01 | User & Authentication | Implemented | Frontend auth now completes bypass/demo login, registration, expiring OTP/resend, workspace routing, editable persisted demo profile, role display, guarded navigation, and logout. API mode remains limited to documented register/login/me behavior and sends no guessed OTP/profile/workspace/logout requests. |
| 02 | Create Course | Implemented | Five-step wizard has validation and navigation. Demo mode continues to the seeded source workspace; API mode calls documented course creation and uses the returned ID. Unsupported course fields remain local. |
| 03 | Knowledge Upload | Implemented | Demo mode supports file and URL sources with batch validation (up to 10 files, 25 MB each), persistent source state, readiness, and recovery. API mode connects documented file upload/list/delete with status refresh; URL metadata/retry and analysis remain mocked where endpoints are absent. |
| 04 | AI Knowledge Processing | Implemented | Staged processing, missing-source guard, failure/retry, grounded result inspection, relationships, sequencing, references, and generation handoff are connected with mock data. |
| 05 | AI Course Generator | Implemented | Generation entry, seven-stage progress, failure/retry, structured modules/lessons/exercises/quizzes/tasks/assessment, result inspection, grounding, and review handoff work with persisted frontend mocks. |
| 06 | Creator Review / Human Verification | Implemented | Creator can inspect, edit, save/cancel, trace sources, mark required items Verified/Needs changes, retain review progress, and preview without bypassing publish readiness. Backend verification is not connected. |
| 07 | Course Preview & Publishing | Implemented | Responsive learner preview, readiness validation, disabled reasons, confirmation, publish failure/retry, published success, copy link, unpublish, republish, and My Courses lifecycle actions work locally. No backend publication/public learner URL exists. |
| 08 | Learning Goal & Learning Style | Implemented | Learner workspace, Published course entry, primary goal, optional detail, familiarity, multi-select content preferences, pace, optional session length, validation, local persistence, editing, and pre-assessment handoff work without a backend. |
| 09 | Pre-Assessment | Implemented | Intro, eight-question MCQ/multi-select attempt, autosaved progress, unanswered validation, answer review, submission confirmation, staged evaluation, and per-skill scoring work locally. |
| 10 | Skill Gap Analysis | Implemented | Constructive readiness summary, centralized competency bands, the three lowest priority gaps, strengths, and read-only answer review are derived from the completed pre-assessment. |
| 11 | Personalized / Adaptive Learning Path | Implemented | Assessment-gated generation uses skill scores plus Function 08 goal/preferences/pace to order priority practice, recommended content, and quick refreshers; version and assessment provenance persist locally without exposing internal attempt IDs. |
| 12 | Learning Experience | Implemented | Personalized lesson order and activity formats, responsive path navigation, readable content, simple source attribution, explicit completion/Next behavior, saved position, progress, recovery, quick-check handoffs, and resume work locally. |
| 13 | Quiz / Post-Assessment | Implemented | Reusable one-question flow supports MCQ/multi-select, validation, saved attempts, quick feedback, centralized pass criteria, staged Post-Assessment analysis, pre/post skill comparison, and retry. |
| 14 | Practical Assessment & Submission | Implemented | Structured campaign-plan task/draft, Save draft, validation, confirmation, staged mock evaluation, readable weighted rubric, strengths/improvement feedback, pass/needs-practice results, and retry work locally. |
| 15 | Skill Result & Feedback | Implemented | Completion-gated completed/more-practice results combine pre/post knowledge and practical evidence, show improvement and feedback, and mark Verified only when all centralized rules pass. |
| 16 | Skill Evidence / Portfolio / Credential | Implemented | Course-scoped portfolio sections, per-skill evidence, incomplete/Verified states, evidence traceability, derived credential eligibility, explicit persisted demo claim/issuance, requirements, issued/eligible/not-offered states, preview sharing, and browser print work from persisted frontend results. No backend issuance or public verification exists. |
| 17 | Creator Dashboard & Analytics | Implemented | Creator home metrics, lifecycle summary, recent course actions, course/time filters, learner funnel and drop-off, course/assessment/skill/content performance, deterministic insights, course detail, no-data/loading/error states, and client-side CSV export work from coherent frontend fixtures. No analytics backend contract exists. |
| 18 | Organization Workspace | Implemented | Organization users reach a dedicated workspace with learning overview metrics, lifecycle-aware courses, reusable course analytics, a fictional learning-only learner roster/detail, aggregate skill outcomes, working filters, strict workspace access, and explicit empty/loading/error/no-activity states. No Organization backend contract exists. |
| 19 | Administrator | Implemented | A role-guarded, read-only Admin workspace provides platform user/workspace/role oversight, course lifecycle and outcome inspection, lightweight activity oversight, working filters/details, and explicit empty/loading/error states. Admin is available only through an explicit bypass preview or a future server-assigned Admin role; no Admin API contract exists. |
| 20 | Notifications / Reports / Supporting States | Implemented | Role-aware notifications support unread filtering, mark-one/all-read persistence, valid destinations, empty/loading/error states, and a shell badge. Creator, Organization, and Admin views export filtered CSV reports through one utility; shared loading/error/empty/invalid primitives, the existing toast/dialog systems, explained disabled controls, and a global Not Found recovery complete the frontend supporting layer. No notification delivery or report backend exists. |

## Current verified continuity

`Frontend Demo sign in → Creator prototype → local course configuration → mock knowledge sources → mock knowledge analysis → AI generation → Human Verification → learner preview → local publish/unpublish`

API mode separately preserves `backend sign in → backend course creation → backend documents`; the documented API does not yet expose the remaining OTP/workspace/analysis transitions.

Functions 05–07 now preserve the required sequence:

`Generate → Creator Review / Human Verification → Preview → Publish → optional Unpublish`

The Learner journey now runs through Functions 08–16: preferences, assessment, Skill Gap, personalized path, learning, knowledge checks, practical evidence, Skill Result, and the derived Skill Portfolio/Credential flow. Backend integration for these learner features remains separate future work.

The Organization journey now runs `Organization authentication → Overview → Courses → Course performance → Learners → Learner outcomes → Skills & Outcomes` with frontend fixtures. It does not grant Creator editing, Admin access, or HR capabilities.

The Admin oversight journey now runs `explicit Admin authorization → Overview → Users → User detail → Courses → Course outcome detail → Platform activity`. Admin remains excluded from registration, and the frontend does not claim server authorization or Admin APIs that `API_doc.md` does not document.
