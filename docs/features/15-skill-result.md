# 15 — Skill Result & Feedback

## Purpose

Summarize learning, knowledge improvement, applied evidence, and actionable feedback before handing the verified outcome to Function 16.

## Primary user

Learner.

## Routes and flow

- Result: `/learner/courses/[courseId]/result`
- Function 16 handoff: `/learner/courses/[courseId]/skill-evidence`
- Practical result → Skill Result → Skill Evidence / Portfolio

## Components and data model

`SkillResultWorkspace` uses `LearnerSkillResult` and `SkillScoreComparison`. The centralized result engine combines Post-Assessment at 60% and Practical Assessment at 40%.

## States and validation

Loading, not ready, Completed/Verified, and More practice recommended. Results include before/after skills, practical evidence, strengths, improvements, and next steps.

## Mock logic and persistence

The calculated result persists in the shared learner journey. Learner Home reflects in-progress or completed status and resumes the latest stage.

## Completion and verification rules

Verified requires all personalized lessons completed, Post-Assessment submitted and passed, Practical Assessment evaluated and passed, and practical evidence present. Quiz score alone can never produce Verified. Course completion uses the same centralized checks.

## Known limitations and future backend integration

No backend competency authority, reviewer signature, or standardized score model. Function 16 now derives frontend portfolio and credential states from this result, but no production issuance or verification URL exists.
