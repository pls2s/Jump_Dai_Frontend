# SkillSync AI

SkillSync AI is an AI-powered learning platform that helps creators turn trusted source material into structured, source-grounded learning experiences. This repository contains the Creator prototype through local publishing and the Learner prototype through personalized learning, assessment, applied evidence, and skill feedback.

The design system is an internal foundation. Its development-only reference is available at `/ui-preview`; the product entry route leads to the authentication journey.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Lucide React icons
- Anuphan through `next/font`
- Shared backend API client with documented response/error envelopes
- Switchable frontend-demo and API-connected authentication
- Backend authentication, course creation/listing, and document upload/list/delete integrations
- Browser storage for demo session, course, profile, and source continuity

## Prerequisites

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm 10 or newer

Check your installed versions:

```bash
node --version
npm --version
```

## Installation

```bash
npm install
```

## Local development

Copy the environment template, then start the frontend:

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to [http://localhost:3000/sign-in](http://localhost:3000/sign-in).

The default template enables frontend-only demo mode, so the backend is not required for product and UX testing. The documented API-connected setup is:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

From the separate backend repository, the API document specifies:

```bash
uvicorn app.main:app --reload
```

The API document still describes a Vite frontend on port `5173`; this repository is Next.js and runs on `3000`. The backend CORS allowlist must include `http://localhost:3000` for browser requests from this frontend.

## Frontend-only Demo Mode

Frontend Demo Mode lets the team test the current product journey without starting the backend. Set the public development flag in `.env.local`:

```env
NEXT_PUBLIC_FRONTEND_DEMO_MODE=true
```

Restart `npm run dev` after changing the flag. In this mode:

- Sign-in validates the development fixtures locally after a short simulated delay.
- **Demo access** buttons can enter each workspace directly.
- Registration, OTP verification, and workspace selection use temporary browser state.
- Creator course setup uses a demo course, then continues through mock sources and mock knowledge analysis.
- No authentication, course, profile, or document request is sent to the backend during the normal demo journey.

Use `123456` as the development-only OTP. Set `NEXT_PUBLIC_FRONTEND_DEMO_MODE=false` to restore the existing API-connected authentication and course/document integrations. API mode requires the backend at `NEXT_PUBLIC_API_URL`.

## Frontend Bypass Mode

Frontend Bypass Mode is a temporary development-only layer for opening every implemented UI without a backend, login, OTP, or prerequisite setup. Create or update `.env.local`:

```env
NEXT_PUBLIC_FRONTEND_BYPASS=true
```

Then restart the frontend and open the route index:

```bash
npm run dev
```

[http://localhost:3000/dev/frontend-preview](http://localhost:3000/dev/frontend-preview)

When enabled, SkillSync accepts any non-empty Sign In email/password into a persistent `Frontend Preview` Creator session, allows protected route guards to resolve locally, and supplies structured fixtures for direct route review. No login credential fixture is checked and no backend authentication request is made. The preview index links to Functions 01–19, including processing, result, evidence, eligibility, oversight, and failure variants.

To restore normal behavior:

```env
NEXT_PUBLIC_FRONTEND_BYPASS=false
```

With bypass off, the existing `NEXT_PUBLIC_FRONTEND_DEMO_MODE` setting continues to choose between frontend demo authentication and the real API path. Set both flags to `false` for API-connected mode. Bypass defaults to off when the variable is missing and `/dev/frontend-preview` returns Not Found.

To verify true bypass login, enter any non-empty values such as `test@test.com` and `abc`, then select **Sign in**. The default destination is `/creator`; the Sign In and Account Type screens never expose Admin. Function 19 is entered only through the development route index, which creates an explicit bypass-only Admin preview role before opening `/admin`.

## Demo accounts

Development / Demo only. These fixtures mirror the backend seed users and must not be used in production.

| Workspace | Email | Password | Backend role |
| --- | --- | --- | --- |
| Learner | `demo@skillsync.local` | `password123` | `learner` |
| Creator | `creator@skillsync.local` | `password123` | `creator` |
| Organization | `organization@skillsync.local` | `password123` | `creator` |

These credentials are development fixtures only and must never be used in production. In Frontend Demo Mode, enter them normally or use the subtle **Demo access** buttons to enter a workspace directly.

### Authentication QA

1. Enable demo mode and start only the frontend.
2. Open `/sign-in`, sign in as each fixture, and confirm Creator, Learner, and Organization reach their matching destinations.
3. Retry with an incorrect password and confirm the error does not mention backend availability.
4. Use **Enter as Creator**, refresh `/creator`, then sign out and confirm `/creator` redirects to sign-in.
5. Register a temporary user, enter invalid OTP digits, then verify with `123456` and choose a workspace.
6. As Creator, complete course setup → knowledge sources → knowledge analysis → generation → Human Verification → preview → publish.
7. Set demo mode to `false`, start the backend, and repeat login/registration plus numeric-course document upload to test the preserved API path.

## Validation and production build

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm run start` serves the production build at `http://localhost:3000` after `npm run build` completes.

## Product routes

| Area | Routes |
| --- | --- |
| Entry and auth | `/`, `/sign-in`, `/create-account`, `/verify-otp`, `/account-type`, `/organization/onboarding` |
| Learner workspace | `/learner`, `/learner/courses/[courseId]/learning-profile`, `/pre-assessment`, `/skill-gap`, `/skill-gap/review`, `/learning-path`, `/learn/[lessonId]`, `/quiz/[quizId]`, `/post-assessment`, `/practical-assessment`, `/result`, `/skill-evidence` |
| Creator workspace | `/creator`, `/creator/courses`, `/creator/analytics`, `/creator/account` |
| Course setup | `/creator/courses/new/basics`, `/audience`, `/objectives`, `/certificate`, `/review` |
| Knowledge sources | `/creator/courses/[courseId]/sources` |
| Knowledge analysis | `/creator/courses/[courseId]/analysis` |
| AI course generation | `/creator/courses/[courseId]/generate`, `/generated` |
| Creator review | `/creator/courses/[courseId]/review` |
| Preview and publishing | `/creator/courses/[courseId]/preview`, `/published` |
| Internal development | `/ui-preview` |
| Frontend bypass index | `/dev/frontend-preview` (bypass mode only) |

## Creator Demo Flow

Install and start the frontend with demo mode enabled:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Confirm `.env.local` contains `NEXT_PUBLIC_FRONTEND_DEMO_MODE=true`, then open `/sign-in` and choose **Enter as Creator** or use `creator@skillsync.local` / `password123`.

Follow this sequence:

```text
Creator workspace
→ Course setup
→ Knowledge sources
→ Knowledge analysis
→ AI course generation
→ Generated course
→ Creator Review / Human Verification
→ Learner preview
→ Publish
→ Published course management
```

Generation, editing, verification, publishing, and unpublishing are simulated frontend behavior. No AI or publishing backend is called.

## Learner Demo Flow

Sign in as the Learner demo account, then follow:

```text
Learner workspace
→ Digital Marketing Foundations
→ Learning Goal & Style
→ Pre-Assessment
→ Skill Gap
→ Personalized Learning Path
→ Learning Experience
→ Quick Quiz / Post-Assessment
→ Practical Assessment
→ Skill Result
→ Skill Portfolio
→ Skill Detail and Evidence
→ Credential Requirements
→ Credential Preview
→ Claim Demo Credential
```

Assessment scoring, practical evaluation, path generation, portfolio evidence, and credential eligibility are deterministic frontend simulations. Learner Home resumes the latest saved stage. An eligible credential must be explicitly claimed; its demo issuance record persists in the existing local learner journey. Credential links are frontend preview URLs and Print / Save as PDF uses the browser print dialog; there is no public verification or issuance backend.

## Project structure

```text
src/
  app/                       Next.js routes, layouts, metadata, and global styles
  components/
    layout/                  Responsive application shell and page layout primitives
    shared/                  Cross-feature product elements such as branding
    ui/                      Reusable buttons, cards, fields, status, progress, and stepper
  data/
    mock/                    Product fixtures and backend-mirrored demo auth users
    design-system.ts         Internal token-preview content
    navigation.ts            Product and internal navigation configuration
  features/
    auth/                    Mode-aware auth service, documented API calls, screens, and sessions
    courses/                 Mode-aware course service and documented API contracts
    course-setup/            Course setup state and wizard
    creator/                 Creator shell, home, and account UI
    learner/                 Minimal role-separated Learner workspace shell and home
    learner-onboarding/      Function 08 learning profile and persistence
    learner-assessment/      Function 09 assessment UI, configuration, and scoring engine
    learner-journey/         Shared assessment/result/path types, services, and persistence
    skill-gap/               Function 10 skill snapshot and answer review
    personalized-learning/   Function 11 mock path generator and learner path workspace
    learning-experience/     Function 12 personalized lesson delivery and navigation
    learner-quiz/            Function 13 reusable quiz and Post-Assessment workspace
    practical-assessment/    Function 14 draft, rubric, and mock evaluation
    skill-result/            Function 15 completion and verification result logic
    skill-portfolio/         Function 16 evidence, eligibility, and credential preview
    knowledge-sources/       Source upload and management workspace
    knowledge-analysis/      Mock AI processing and analysis result workspace
    course-generation/       Generated-course state, generator, outline, and content detail
    course-review/           Human Verification editor and per-item review flow
    course-publishing/       Learner preview, readiness, publish, and unpublish flow
    source-grounding/        Reusable source-reference drawer
    design-system/           Internal `/ui-preview` implementation
  lib/                       Central environment config and framework-agnostic helpers
    api/                     Shared API envelope, error, auth-header, and upload handling
    mock/                    Simulated async services and local source storage
  types/                     Shared navigation and product contracts
docs/
  features/                  Feature behavior and limitation notes
```

## Environment variables

The environment template contains both public configuration values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_DEMO_MODE=true
NEXT_PUBLIC_FRONTEND_BYPASS=false
```

`NEXT_PUBLIC_FRONTEND_BYPASS=true` temporarily overrides authentication and route dependencies for UI review. When bypass is false, `NEXT_PUBLIC_FRONTEND_DEMO_MODE=true` selects browser-only authentication and `false` selects the real API client. Do not place secrets in `NEXT_PUBLIC_*` variables or commit `.env.local`. Manual-text sources, URL fetching, knowledge analysis, course generation, verification, publishing, and citations remain simulated where backend integration is not connected.

## Troubleshooting

- **The app does not start:** confirm the Node.js version meets the prerequisite, then run `npm install` again.
- **Demo access is missing:** enable Demo Mode or Bypass Mode, then restart `npm run dev`; public environment values are compiled into the frontend.
- **Frontend preview index returns Not Found:** set `NEXT_PUBLIC_FRONTEND_BYPASS=true` in `.env.local`, then restart `npm run dev`.
- **API mode reports that SkillSync cannot be reached:** start the backend and confirm `NEXT_PUBLIC_API_URL`; restart `npm run dev` after changing a public environment variable.
- **The browser reports a CORS error:** `API_doc.md` currently allows only the old Vite origin on port 5173. Add the current Next.js origin `http://localhost:3000` to the backend development CORS allowlist.
- **OTP or workspace selection is unavailable in API mode:** those capabilities have no endpoints, request schemas, or response schemas in `API_doc.md`; the frontend deliberately does not guess them. Use demo mode for the frontend-only journey.
- **Port 3000 is occupied:** run `npm run dev -- --port 3001` and open the URL printed by Next.js.
- **Course values look stale:** the wizard intentionally saves demo values in `localStorage` under `skillsync-course-setup`. Clear site data to reset the prototype.
- **Source changes should be reset:** clear site data for the `skillsync-sources:*` localStorage keys.
- **Font loading fails on a restricted network:** Next.js needs access to fetch the configured Google font during installation/build in a fresh environment.
- **Build types appear stale:** remove only the generated `.next` directory, then run `npm run typecheck` and `npm run build` again.

## Feature documentation

- [Authentication](docs/features/01-authentication.md)
- [Create Course](docs/features/02-create-course.md)
- [Knowledge Upload](docs/features/03-knowledge-upload.md)
- [AI Knowledge Processing](docs/features/04-ai-knowledge-processing.md)
- [AI Course Generator](docs/features/05-ai-course-generator.md)
- [Creator Review / Human Verification](docs/features/06-creator-review.md)
- [Course Preview & Publishing](docs/features/07-course-publishing.md)
- [Learning Goal & Learning Style](docs/features/08-learning-goal-style.md)
- [Pre-Assessment](docs/features/09-pre-assessment.md)
- [Skill Gap](docs/features/10-skill-gap.md)
- [Personalized Learning Path](docs/features/11-personalized-learning-path.md)
- [Learning Experience](docs/features/12-learning-experience.md)
- [Quiz / Post-Assessment](docs/features/13-quiz-post-assessment.md)
- [Practical Assessment](docs/features/14-practical-assessment.md)
- [Skill Result & Feedback](docs/features/15-skill-result.md)
- [Feature roadmap](docs/04-feature-roadmap.md)
- [Requirement and flow audit](docs/05-requirement-flow-audit.md)
- [Changelog](docs/CHANGELOG.md)
