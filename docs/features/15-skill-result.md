# 15 — Skill Result & Feedback

## Purpose

Summarize learning, knowledge improvement, applied evidence, and actionable feedback before handing the verified outcome to Function 16.

## Primary user

Learner.

## Routes and flow

- Result: `/learner/courses/[courseId]/result`
- Bypass previews: `?state=completed` and `?state=more-practice`
- Function 16 handoff: `/learner/courses/[courseId]/skill-evidence`
- Practical result → Skill Result → Skill Evidence / Portfolio

## Components and data model

`SkillResultWorkspace` uses `LearnerSkillResult` and `SkillScoreComparison`. The centralized result engine combines Post-Assessment at 60% and Practical Assessment at 40%.

## States and validation

Loading, not ready, Completed/Verified, and More practice recommended. Direct bypass fixtures expose both result outcomes. Results include before/after skills, practical evidence, strengths, improvements, and next steps.

## Mock logic and persistence

The calculated result persists in the shared learner journey. Learner Home reflects in-progress or completed status and resumes the latest stage.

## Completion and verification rules

Verified requires all personalized lessons completed, Post-Assessment submitted and passed, Practical Assessment evaluated and passed, and practical evidence present. Quiz score alone can never produce Verified. Course completion uses the same centralized checks.

## API mode

For a numeric backend course ID, this route reads the learner's latest own Post-Assessment and Practical Assessment attempts with `GET /api/assessments/{assessment_id}/my-attempts`. It displays the exact stored topic scores, feedback, pass state, evidence, and any Creator review note.

The backend does not expose a course-level Skill Result, pre/post comparison, competency aggregation, credential issuance, or automatic Function 16 evidence creation. API mode therefore shows saved assessment results rather than presenting a frontend-derived outcome as verified.

## Known limitations

No backend competency authority, reviewer signature workflow, standardized course-result score, or automatic portfolio issuance exists. Function 16 portfolio evidence must still be created through its own API contract. Mock backend data resets when the backend server reloads.
