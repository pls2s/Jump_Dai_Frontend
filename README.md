# SkillSync AI

SkillSync AI is an AI-powered learning platform that helps creators turn trusted source material into structured, source-grounded learning experiences. This repository currently contains a front-end product prototype for authentication, course setup, knowledge-source management, and AI knowledge analysis.

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

```bash
npm run dev
```

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
6. As Creator, complete course setup → knowledge sources → knowledge analysis → generation placeholder.
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
| Entry and auth | `/`, `/sign-in`, `/create-account`, `/verify-otp`, `/account-type`, `/learner/onboarding`, `/organization/onboarding` |
| Creator workspace | `/creator`, `/creator/courses`, `/creator/analytics`, `/creator/account` |
| Course setup | `/creator/courses/new/basics`, `/audience`, `/objectives`, `/certificate`, `/review` |
| Knowledge sources | `/creator/courses/[courseId]/sources` |
| Knowledge analysis | `/creator/courses/[courseId]/analysis` |
| Generation placeholder | `/creator/courses/[courseId]/generate` |
| Internal development | `/ui-preview` |

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
    knowledge-sources/       Source upload and management workspace
    knowledge-analysis/      Mock AI processing and analysis result workspace
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
```

`NEXT_PUBLIC_FRONTEND_DEMO_MODE=true` selects browser-only authentication. `false` selects the real API client. Do not place secrets in `NEXT_PUBLIC_*` variables or commit `.env.local`. Manual-text sources, URL fetching, knowledge analysis, and citations remain simulated because matching endpoints are not documented.

## Troubleshooting

- **The app does not start:** confirm the Node.js version meets the prerequisite, then run `npm install` again.
- **Demo access is missing:** set `NEXT_PUBLIC_FRONTEND_DEMO_MODE=true`, then restart `npm run dev`; public environment values are compiled into the frontend.
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
- [Feature roadmap](docs/04-feature-roadmap.md)
- [Requirement and flow audit](docs/05-requirement-flow-audit.md)
- [Changelog](docs/CHANGELOG.md)
