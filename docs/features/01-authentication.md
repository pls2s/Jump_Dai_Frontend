# 01 — User & Authentication

## Purpose

Provide a calm, credible entry into SkillSync with centralized API, frontend-demo, and temporary frontend-bypass behavior while preserving the authentication contract documented in `API_doc.md`.

## User goal

Create or access an account, reach the correct workspace, retain a safe frontend session across refreshes, and sign out.

## Routes

- `/` redirects to `/sign-in`
- `/sign-in`
- `/create-account`
- `/verify-otp`
- `/account-type`
- `/learner`, `/creator`, or `/organization/onboarding` after demo authentication
- `/creator` after API login because the documented response has no role/workspace field

## Main screens

- Sign in with email, password, remember-me, password recovery feedback, and Google option
- Create account with name, email, password, and terms acceptance
- Six-digit OTP verification and account-type selection in demo mode
- Intentional contract-gap states at OTP and account-type routes in API mode

## Components

- `AuthShell` provides shared branding, responsive layout, and product value context
- `SignInForm`, `CreateAccountForm`, `OtpForm`, and `AccountTypeForm` own screen interactions
- Shared `Button`, `Input`, `Checkbox`, `Field`, and `BrandMark` primitives

## Interactions

- `auth-service.ts` selects demo or API behavior from the centralized public environment flag
- Demo sign-in validates against the shared seed fixtures, simulates loading, creates a password-free local session, and routes by workspace
- Demo access buttons create the same session directly without submitting the form
- API sign-in calls `POST /api/auth/login` with exactly `email` and `password`
- API login reads exactly `access_token`, `token_type`, and user `id`, `name`, `email`
- Google sign-in reports that it is not connected instead of creating a fake session
- Demo account creation stores temporary registration data in `sessionStorage`, verifies development OTP `123456`, then creates a session after workspace selection
- API account creation calls `POST /api/auth/register` with exactly `name`, `email`, and `password`, then returns to sign-in
- `/creator/account` reads the demo session in demo mode or calls authenticated `GET /api/auth/me` in API mode
- OTP and workspace screens never issue guessed API requests in API mode
- Sign out from `/creator/account` returns to `/sign-in`
- `NEXT_PUBLIC_FRONTEND_BYPASS=true` makes the shared session lookup synthesize the development-only `Frontend Preview` identity, so existing guards allow direct UI review without backend calls
- Sign In and OTP expose small bypass-only preview actions; account type remains limited to Learner, Creator, and Organization
- `/dev/frontend-preview` lists Functions 01–08 only while bypass is enabled and returns Not Found otherwise

## States

- Pending button states for sign-in, sign-up, and profile loading
- Registration, authentication, authorization, validation, network, and response-shape errors
- Current-user retry state
- Invalid/incomplete demo OTP and missing/expired temporary registration context
- Intentional unsupported states for undocumented API capabilities

## Mock behavior

Seed users live in `src/data/mock/auth-users.ts`. Only the demo branch in `src/features/auth/services/auth-service.ts` matches these fixtures; UI components do not contain credential logic. The OTP fixture lives in `src/data/mock/auth.ts`. API calls remain isolated in `src/features/auth/api/auth-api.ts`; shared transport lives in `src/lib/api/api-client.ts`.

The bypass identity also lives in `src/data/mock/auth.ts`, contains no credential, and is synthesized through `auth-session.ts`. Bypass defaults to off and sits above—not in place of—the existing demo/API switch.

## Known limitations

- Demo sessions and API tokens are stored in browser storage and routes are guarded client-side; production requires an HTTP-only server session and server authorization
- Google OAuth, password reset, OTP, OTP resend, workspace selection, logout/revocation, profile updates, and roles in auth responses are not documented
- API mode cannot perform authoritative role-based landing-page routing because the documented response has no role/workspace data; backend permissions remain authoritative
- Learner and organization workspaces are placeholders only
- Bypass mode intentionally recreates its preview identity after sign-out until the environment flag is turned off
- The backend was not available at `localhost:8000` during the 16 August 2026 frontend QA run, so seeded-account and registration integration could not be live-verified
