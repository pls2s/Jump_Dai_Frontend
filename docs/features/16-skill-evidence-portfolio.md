# 16 — Skill Evidence / Portfolio / Credential

## Purpose

Show a learner’s verified practical evidence and verifiable credentials without presenting frontend demo records as backend data.

## Existing routes

- Portfolio: `/learner/courses/[courseId]/skill-evidence`
- Skill evidence: `/learner/courses/[courseId]/skill-evidence/skills/[skillId]`
- Credential requirements: `/learner/courses/[courseId]/skill-evidence/requirements`
- Credential verification: `/learner/courses/[courseId]/skill-evidence/credentials/[credentialId]`

The API portfolio is learner-scoped. The existing course ID in these routes is retained for navigation, while the backend returns verified evidence across the learner’s portfolio.

## API integration

For an authenticated API learner, the existing screens use:

- `GET /api/skill-portfolio` — verified skills, passing evidence, and issued credentials
- `POST /api/skill-portfolio/share` — create/reuse a public backend share link
- `GET /api/credentials/{credential_id}/verify` — public credential verification

Portfolio views display only the backend fields: competency score/level, evidence title and URL, score, course/assessment context, issue date, and credential validity. The shared link copied from the UI is the actual backend public URL.

## Evidence and issuance rule

Backend evidence is created by `POST /api/skill-evidence`. A practical evidence item becomes a verified skill only when `score >= passing_score`. A passing item can issue one Digital Badge per course/skill; if it is marked as the final course assessment, it can also issue a Certificate for the course.

Function 16 currently reads and verifies that backend data. The existing Function 14 practical-assessment UI is still mock-only, so it does not yet submit evidence automatically. Until that connection exists, create test evidence through Swagger or the API.

## API-mode boundaries

- The backend does not expose before/after scores, rubric rows, learning-activity evidence, or a credential-requirement checklist; API mode does not fill these with demo values.
- The existing Requirements route clearly reports this missing API contract instead of showing the local checklist.
- An empty API portfolio is a valid state and means no passing evidence has been submitted yet.
- Demo and bypass sessions retain their existing local portfolio and simulated credential-claim experience.

## Test order

1. Login as `demo@skillsync.local` in API mode.
2. Submit passing practical evidence through `POST /api/skill-evidence`.
3. Open the Portfolio route and verify the skill/evidence/credential pages.
4. Use **Copy public API link** and open the URL in a separate browser session.
