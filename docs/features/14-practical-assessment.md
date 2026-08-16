# 14 — Practical Assessment

## Purpose

Collect evidence that the learner can apply course knowledge in a coherent campaign plan.

## Primary user

Learner.

## Route and flow

- `/learner/courses/[courseId]/practical-assessment`
- Bypass states: `?state=task`, `draft`, `evaluating`, `passed`, and `needs-practice`
- Passing Post-Assessment → task/draft → confirmation → evaluation → pass or improve/retry → Skill Result

## Components and data model

`PracticalAssessmentWorkspace` uses `PracticalDraft`, `PracticalAssessmentState`, and weighted `PracticalRubricScore` records. The task collects objective, audience, channels, core message, and measurement metrics.

## States and validation

Not started, saved draft, submitted/evaluating, passed, and needs more practice. Every structured field needs sufficient content before submission. The confirmation dialog prevents accidental final submission. Result feedback calls out the strongest rubric area and the clearest improvement priority in addition to criterion-level feedback.

## Mock logic and persistence

Drafts persist locally on Save draft. A deterministic mock evaluator scores objective 25%, audience 20%, channel rationale 25%, and measurement 30%; 70% passes. Evaluation stages are simulated and explicitly documented as frontend-only.

## Completion rules

The practical must be evaluated, pass, and contain a submitted evidence summary. Opening the task or saving a draft does not satisfy completion.

## Known limitations and future backend integration

No file upload, real AI/SME evaluation, resubmission history, creator review, or server evidence storage. These require documented submission and grading APIs.
