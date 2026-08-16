# SkillSync AI feature roadmap

Status reflects whether a complete frontend user goal can be achieved—not whether a route or static placeholder exists.

| ID | Feature | Status | Current scope |
| --- | --- | --- | --- |
| 00 | Design Foundation | Partial | Core tokens, inputs, buttons, cards, badges, navigation, progress, stepper, confirmation dialog, grounding drawer, and responsive patterns exist. There is no general toast primitive yet. |
| 01 | User & Authentication | Needs Review | Frontend Demo Mode completes sign-in, registration, OTP, workspace selection, persistent session, role routing, and logout without the backend. API mode preserves documented login/register/me integration; API OTP/workspace/logout/profile-update capabilities remain undocumented. |
| 02 | Create Course | Needs Review | Five-step wizard has validation and navigation. Demo mode continues to the seeded source workspace; API mode calls documented course creation and uses the returned ID. Unsupported course fields remain local. |
| 03 | Knowledge Upload | Needs Review | Demo mode completes local file/text/URL source handling and readiness flow. API mode connects documented file upload/list/delete with status refresh; text, URL, retry, and analysis remain explicitly mocked where endpoints are absent. |
| 04 | AI Knowledge Processing | Needs Review | Staged processing, missing-source guard, failure/retry, grounded result inspection, relationships, sequencing, references, and generation handoff are connected with mock data. |
| 05 | AI Course Generator | Needs Review | Generation entry, seven-stage progress, failure/retry, structured modules/lessons/exercises/quizzes/tasks/assessment, result inspection, grounding, and review handoff work with persisted frontend mocks. |
| 06 | Creator Review / Human Verification | Needs Review | Creator can inspect, edit, save/cancel, trace sources, mark required items Verified/Needs changes, retain review progress, and preview without bypassing publish readiness. Backend verification is not connected. |
| 07 | Course Preview & Publishing | Needs Review | Responsive learner preview, readiness validation, disabled reasons, confirmation, publish failure/retry, published success, copy link, unpublish, republish, and My Courses lifecycle actions work locally. No backend publication/public learner URL exists. |
| 08 | Learning Goal & Learning Style | Needs Review | Learner workspace, course start, primary goal, optional detail, familiarity, multi-select content preferences, pace, optional session length, validation, local persistence, editing, and pre-assessment handoff work without a backend. |
| 09 | Pre-Assessment | Needs Review | Intro, eight-question MCQ/multi-select attempt, autosaved progress, unanswered validation, answer review, submission confirmation, staged evaluation, and per-skill scoring work locally. |
| 10 | Skill Gap Analysis | Needs Review | Constructive readiness summary, centralized competency bands, priority gaps, strengths, and read-only answer review are derived from the completed pre-assessment. |
| 11 | Personalized / Adaptive Learning Path | Needs Review | Assessment-gated generation uses skill scores plus Function 08 goal/preferences/pace to order priority practice, recommended content, and quick refreshers; path evidence/version persist locally. |
| 12 | Learning Experience | Not Started | An intentional handoff route exists; lesson delivery, progress, prerequisites, and last position are not implemented. |
| 13 | Quiz / Post-Assessment | Not Started | No quiz or post-assessment flow exists. |
| 14 | Practical Assessment & Submission | Not Started | No task, evidence upload, rubric, or grading flow exists. |
| 15 | Skill Result & Feedback | Not Started | No competency result experience exists. |
| 16 | Skill Evidence / Portfolio / Credential | Not Started | No verified-skill or credential UI exists. |
| 17 | Creator Dashboard & Analytics | Not Started | The current route is an honest empty destination, not analytics functionality. |
| 18 | Organization Workspace | Not Started | Organization selection reaches an intentional placeholder with no Creator/Admin access. |
| 19 | Administrator | Not Started | Admin cannot be self-selected and no Admin routes exist. |
| 20 | Notifications / Reports / Supporting States | Partial | Current features cover local loading, success, validation, disabled, empty, and error states. Notifications and report export are not implemented. |

## Current verified continuity

`Frontend Demo sign in → Creator prototype → local course configuration → mock knowledge sources → mock knowledge analysis → AI generation → Human Verification → learner preview → local publish/unpublish`

API mode separately preserves `backend sign in → backend course creation → backend documents`; the documented API does not yet expose the remaining OTP/workspace/analysis transitions.

Functions 05–07 now preserve the required sequence:

`Generate → Creator Review / Human Verification → Preview → Publish → optional Unpublish`

The Learner journey now runs through Functions 08–11 and stops at an intentional Function 12 destination. Backend integration for 05–11 remains separate future work.
