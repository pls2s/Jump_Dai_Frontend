# 16 — Skill Evidence / Portfolio / Credential

## Purpose

Turn the learner’s persisted course outcome into an understandable, reusable record of skills, supporting evidence, and credential eligibility without claiming a production credential service.

## Primary user

Learner.

## Routes and user flow

- Portfolio and section tabs: `/learner/courses/[courseId]/skill-evidence`
- Skill detail: `/learner/courses/[courseId]/skill-evidence/skills/[skillId]`
- Credential requirements: `/learner/courses/[courseId]/skill-evidence/requirements`
- Credential preview: `/learner/courses/[courseId]/skill-evidence/credentials/[credentialId]`

`Skill Result → Portfolio Overview → Skill Detail → Evidence Result → Credential Requirements → Credential Preview → Claim Credential`

The portfolio uses Overview, Skills, Evidence, and Credentials sections. The Skill Result CTA and completed-course Learner Home state both lead into this flow.

## Evidence model

`SkillEvidence` records a typed evidence source, learner-facing title and description, optional score, status, completion date, result destination, and optional practical rubric. Supported evidence types include Pre-Assessment, Post-Assessment, quiz, practical assessment, learning activity, creator verification, and credential. Current mock data derives Pre-Assessment, Post-Assessment, learning-activity, and practical evidence from the shared learner journey.

`PortfolioSkill` reuses the Function 15 `SkillVerificationStatus` model. It adds competency, improvement, evidence mapping, verification date, and an actionable reason when verification is incomplete. Raw assessment IDs, scoring objects, and internal implementation data are not shown.

## Skill verification rules

Function 16 calls the verification decision exported by the existing Function 15 result engine. A skill is Verified only when:

- required lessons are complete;
- the final knowledge assessment is complete and passed;
- practical assessment is complete and passed;
- applied evidence is present; and
- that individual skill meets the centralized Post-Assessment threshold.

A completed course therefore does not automatically mark every skill Verified. Proficient, Developing, and Needs more practice remain visible with a reason and next action.

## Credential eligibility rules and states

Credential requirements are derived from `courseCompletionChecks`, per-skill verification, and the generated course’s certificate setting:

- required lessons complete;
- final knowledge assessment passed;
- practical assessment completed;
- practical passing criteria met;
- at least one Verified skill has sufficient evidence; and
- certificate issuance is enabled for the course.

Credential states are `not-eligible`, `eligible`, `issued`, and `revoked`. Revoked exists in the typed lifecycle but has no learner-management UI in this task. If certificates are disabled, the portfolio retains skill evidence and clearly states that no certificate is offered.

Meeting every requirement produces `eligible`, not `issued`. In frontend mock/bypass mode, the learner explicitly claims an eligible credential from its preview. A short issuance state then records the demo identifier, verified skill IDs, and issue time in the existing learner journey. Revising required evidence clears the saved Skill Result and this local issuance record so stale evidence cannot silently remain issued.

## Main screens and interactions

- Portfolio summary derived from actual portfolio contents
- Verified/developing skill list with score and evidence count
- Skill detail with before/after improvement and evidence mapping
- Practical rubric traceability and result links
- Recent evidence timeline
- Credential requirement checklist with text and icons
- Professional credential preview with verified skills and assessment summary
- Explicit Claim credential action with processing, persisted success, and guarded failure feedback
- Copy portfolio, skill, and credential preview links with inline feedback
- Browser `Print / Save as PDF` action for the credential preview
- Empty and incomplete-evidence recovery states

Every evidence item links to its stored assessment or learning result. The mock credential link is a frontend route, not a public verification URL.

## Mock behavior and bypass previews

With `NEXT_PUBLIC_FRONTEND_BYPASS=true`, direct route access hydrates the existing Function 15 demo journey. Preview-only query states are centralized and ignored when bypass is off:

- `state=empty`
- `state=partial`
- `state=not-eligible`
- `state=eligible`
- `state=issued`
- `state=certificate-disabled`

The development route index links to overview, skill, evidence, requirements, credential, incomplete, certificate-disabled, and empty variants.

## Persistence

No new localStorage subsystem was added. Portfolio evidence, verification, and eligibility are derived from the persisted learner journey, learner profile, and course configuration. Only the learner’s explicit demo issuance action is stored in that same journey record (`issuedCredential`) with its deterministic `SS-DEMO-*` identifier, issue time, and verified skill IDs. This lets Eligible and Issued remain distinct across refreshes without duplicating eligibility rules.

## Known limitations

- No backend evidence authority, credential issuance, revocation, or public verification
- No production PDF generator; download uses the browser print dialog
- No social network or LinkedIn integration
- One seeded course and its structured frontend evidence are available
- Practical scoring remains the deterministic Function 14 frontend simulation
- Share links work only inside the running frontend and do not grant public access

## Future backend/API integration

`API_doc.md` does not document portfolio, skill-evidence, credential issuance, credential verification, download, or public sharing endpoints. Future integration should replace the service/builder boundary with server-authoritative evidence and eligibility while retaining the current typed UI model and must not infer undocumented contracts.
