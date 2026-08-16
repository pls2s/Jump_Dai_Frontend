# SkillSync AI feature roadmap

Status reflects whether a complete frontend user goal can be achieved—not whether a route or static placeholder exists.

| ID | Feature | Status | Current scope |
| --- | --- | --- | --- |
| 00 | Design Foundation | Partial | Core tokens, inputs, buttons, cards, badges, navigation, progress, and responsive patterns exist. Dialogs are feature-owned and there is no general toast primitive yet. |
| 01 | User & Authentication | Needs Review | Frontend Demo Mode completes sign-in, registration, OTP, workspace selection, persistent session, role routing, and logout without the backend. API mode preserves documented login/register/me integration; API OTP/workspace/logout/profile-update capabilities remain undocumented. |
| 02 | Create Course | Needs Review | Five-step wizard has validation and navigation. Demo mode continues to the seeded source workspace; API mode calls documented course creation and uses the returned ID. Unsupported course fields remain local. |
| 03 | Knowledge Upload | Needs Review | Demo mode completes local file/text/URL source handling and readiness flow. API mode connects documented file upload/list/delete with status refresh; text, URL, retry, and analysis remain explicitly mocked where endpoints are absent. |
| 04 | AI Knowledge Processing | Needs Review | Staged processing, missing-source guard, failure/retry, grounded result inspection, relationships, sequencing, references, and generation handoff are connected with mock data. |
| 05 | AI Course Generator | Not Started | An intentional destination explains readiness and future output types; no generator functionality exists. |
| 06 | Creator Review / Human Verification | Not Started | No generated course content exists to review. Publishing is explicitly blocked in the generation placeholder. |
| 07 | Course Preview & Publishing | Not Started | No preview or publishing controls exist; there is no shortcut around review. |
| 08 | Learning Goal & Learning Style | Not Started | Learner selection reaches an intentional onboarding placeholder only. |
| 09 | Pre-Assessment | Not Started | No assessment flow exists. |
| 10 | Skill Gap Analysis | Not Started | No scoring or gap-analysis flow exists. |
| 11 | Personalized / Adaptive Learning Path | Not Started | No path generation exists; future work must depend on goal and assessment data. |
| 12 | Learning Experience | Not Started | No learner lesson experience exists. |
| 13 | Quiz / Post-Assessment | Not Started | No quiz or post-assessment flow exists. |
| 14 | Practical Assessment & Submission | Not Started | No task, evidence upload, rubric, or grading flow exists. |
| 15 | Skill Result & Feedback | Not Started | No competency result experience exists. |
| 16 | Skill Evidence / Portfolio / Credential | Not Started | No verified-skill or credential UI exists. |
| 17 | Creator Dashboard & Analytics | Not Started | The current route is an honest empty destination, not analytics functionality. |
| 18 | Organization Workspace | Not Started | Organization selection reaches an intentional placeholder with no Creator/Admin access. |
| 19 | Administrator | Not Started | Admin cannot be self-selected and no Admin routes exist. |
| 20 | Notifications / Reports / Supporting States | Partial | Current features cover local loading, success, validation, disabled, empty, and error states. Notifications and report export are not implemented. |

## Current verified continuity

`Frontend Demo sign in → Creator prototype → local course configuration → mock knowledge sources → mock knowledge analysis → AI Course Generator placeholder`

API mode separately preserves `backend sign in → backend course creation → backend documents`; the documented API does not yet expose the remaining OTP/workspace/analysis transitions.

The next implementation should begin at Function 05 and must preserve the required sequence:

`Generate → Creator Review / Human Verification → Preview → Publish`
