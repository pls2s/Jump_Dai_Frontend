# 08 — Learning Goal & Learning Style

## Purpose

Collect the learner’s primary outcome, self-perceived familiarity, and flexible content/pace preferences before Pre-Assessment. These inputs provide context for later personalization but do not replace assessment evidence.

## Primary user

Learner.

## Route

- Workspace: `/learner`
- Learning profile: `/learner/courses/[courseId]/learning-profile`
- Function 09 handoff: `/learner/courses/[courseId]/pre-assessment`
- Legacy `/learner/onboarding` redirects to `/learner`

## Flow

Learner authentication → Learner workspace → Start course → Learning Goal & Style → save → Pre-Assessment.

Returning to the learning-profile route restores saved selections for editing.

## Form fields

- Primary learning goal: new skill, current role, new role, refresh, required course, explore, or Other
- Optional Other text
- Optional goal detail, limited to 500 characters with a count
- Familiarity: new, basics, some experience, or confident
- Content preferences: short explanations, step-by-step examples, hands-on practice, visual summaries, quick quizzes, and real-world scenarios
- Pace: quick and focused, balanced, or in-depth
- Optional session length: 10–15, 20–30, 30–45 minutes, or flexible

Preferences are framed as adjustable content preferences, not scientifically fixed learning styles. Pace never skips required competency content.

## Validation

Submission requires one learning goal, one familiarity value, at least one content preference, and one pace. Errors render next to and are associated with the relevant fieldset. Goal detail, Other text, and session length are optional.

## States

- Loading saved preferences
- New profile
- Previously saved/editable profile
- Inline validation errors
- Saving
- Save failure with selections retained
- Successful transition to the Pre-Assessment intro

## Mock persistence

Structured option fixtures live in `src/data/mock/learner.ts`. Profiles use the typed `LearnerLearningProfile` contract and persist in localStorage under `skillsync-learner-learning-profile:{learnerId}:{courseId}`. No credential, assessment score, or sensitive profile data is stored.

## Dependencies

- Valid Learner/API/bypass session
- Valid demo course ID
- Function 09 must use this profile as context without treating familiarity as an assessment result

## Transition to Function 09

Valid submission opens the Pre-Assessment intro. Function 09 now delivers the saved-answer assessment, scoring, and Skill Gap transition while keeping self-rated familiarity separate from evidence.

## Known limitations

- One mock learner course is available
- No backend enrollment, catalog, profile, or assessment integration
- Learner Home is deliberately minimal rather than a full dashboard
- Learning-profile data remains local and has no backend contract

## Future API integration

Replace the local learning-profile service with documented learner-profile endpoints when available. Keep the UI types and validation independent from transport, and preserve the dependency order Goal/Profile → Pre-Assessment → Skill Gap → Personalized Path.
