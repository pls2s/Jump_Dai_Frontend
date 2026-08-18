import { FRONTEND_PREVIEW_COURSE_ID } from "@/data/mock/product";

export interface FrontendPreviewRoute {
  label: string;
  href: string;
  description: string;
}

export interface FrontendPreviewGroup {
  functionId: string;
  title: string;
  routes: FrontendPreviewRoute[];
}

const courseRoot = `/creator/courses/${FRONTEND_PREVIEW_COURSE_ID}`;
const learnerCourseRoot = "/learner/courses/digital-marketing-foundations";

/** Development route inventory. Keep this data separate from the preview page UI. */
export const frontendPreviewGroups: FrontendPreviewGroup[] = [
  {
    functionId: "01",
    title: "Authentication",
    routes: [
      { label: "Sign In", href: "/sign-in", description: "Login form and frontend preview entry" },
      { label: "Create Account", href: "/create-account", description: "Registration validation and submission" },
      { label: "Verify OTP", href: "/verify-otp", description: "Six-digit verification interface" },
      { label: "Account Type", href: "/account-type", description: "Learner, Creator, and Organization selection" },
      { label: "Profile", href: "/creator/account", description: "Creator profile and logout controls" },
    ],
  },
  {
    functionId: "02",
    title: "Create Course",
    routes: [
      { label: "Course Basics", href: "/creator/courses/new/basics", description: "Name and description" },
      { label: "Audience & Level", href: "/creator/courses/new/audience", description: "Target learner and difficulty" },
      { label: "Learning Objectives", href: "/creator/courses/new/objectives", description: "Objective creation and validation" },
      { label: "Certificate", href: "/creator/courses/new/certificate", description: "Certificate and completion criteria" },
      { label: "Review Setup", href: "/creator/courses/new/review", description: "Configuration review and edit links" },
    ],
  },
  {
    functionId: "03",
    title: "Knowledge Upload",
    routes: [
      { label: "Sources", href: `${courseRoot}/sources`, description: "Source list and management" },
      { label: "Upload Files", href: `${courseRoot}/sources?view=file`, description: "Upload and drag-and-drop state" },
      { label: "Manual Text", href: `${courseRoot}/sources?view=text`, description: "Title and pasted text source" },
      { label: "URL Source", href: `${courseRoot}/sources?view=url`, description: "URL fetch preview and validation" },
    ],
  },
  {
    functionId: "04",
    title: "AI Knowledge Processing",
    routes: [
      { label: "Processing", href: `${courseRoot}/analysis?view=processing`, description: "Visible multi-step AI pipeline" },
      { label: "Analysis Result", href: `${courseRoot}/analysis?view=result`, description: "Topics, concepts, sequence, and references" },
      { label: "Failure & Retry", href: `${courseRoot}/analysis?view=processing&state=failed`, description: "Recoverable analysis failure" },
    ],
  },
  {
    functionId: "05",
    title: "AI Course Generator",
    routes: [
      { label: "Generation Entry", href: `${courseRoot}/generate`, description: "Readiness summary and generation action" },
      { label: "Generation Failure", href: `${courseRoot}/generate?state=failed`, description: "Safe retry state during generation" },
      { label: "Generated Course", href: `${courseRoot}/generated`, description: "Generated hierarchy and lesson details" },
    ],
  },
  {
    functionId: "06",
    title: "Creator Review",
    routes: [
      { label: "Human Verification", href: `${courseRoot}/review`, description: "Editing, source traceability, and item verification" },
    ],
  },
  {
    functionId: "07",
    title: "Course Preview & Publishing",
    routes: [
      { label: "Course Preview", href: `${courseRoot}/preview`, description: "Learner-facing canvas and readiness rules" },
      { label: "Publish Failure", href: `${courseRoot}/preview?state=failed`, description: "Recoverable simulated publish failure" },
      { label: "Published State", href: `${courseRoot}/published`, description: "Published management and unpublish action" },
    ],
  },
  {
    functionId: "08",
    title: "Learning Goal & Style",
    routes: [
      { label: "Learner Workspace", href: "/learner", description: "Available course and learner entry point" },
      { label: "Learning Profile", href: `${learnerCourseRoot}/learning-profile`, description: "Goal, familiarity, content preferences, and pace" },
      { label: "Pre-Assessment Entry", href: `${learnerCourseRoot}/pre-assessment?view=intro`, description: "Valid next-step destination after saving learning preferences" },
    ],
  },
  {
    functionId: "09",
    title: "Pre-Assessment",
    routes: [
      { label: "Assessment Intro", href: `${learnerCourseRoot}/pre-assessment?view=intro`, description: "Course context, time, and start action" },
      { label: "Assessment Question", href: `${learnerCourseRoot}/pre-assessment?view=question`, description: "One-question flow and saved answer state" },
      { label: "Result Processing", href: `${learnerCourseRoot}/pre-assessment?view=processing`, description: "Meaningful staged result evaluation" },
    ],
  },
  {
    functionId: "10",
    title: "Skill Gap",
    routes: [
      { label: "Skill Snapshot", href: `${learnerCourseRoot}/skill-gap`, description: "Readiness, skill scores, priorities, and strengths" },
      { label: "Assessment Review", href: `${learnerCourseRoot}/skill-gap/review`, description: "Read-only answers, expected answers, and explanations" },
    ],
  },
  {
    functionId: "11",
    title: "Personalized Learning Path",
    routes: [
      { label: "Generating Path", href: `${learnerCourseRoot}/learning-path?view=generating`, description: "Assessment-based path generation stages" },
      { label: "Path Result", href: `${learnerCourseRoot}/learning-path?view=result`, description: "Priorities, refreshers, activities, and rationale" },
      { label: "Generation Failure", href: `${learnerCourseRoot}/learning-path?state=failed`, description: "Safe retry and recovery state" },
    ],
  },
  {
    functionId: "12",
    title: "Learning Experience",
    routes: [
      { label: "Resume Learning", href: `${learnerCourseRoot}/learn`, description: "Current personalized lesson and saved course progress" },
      { label: "Priority Lesson", href: `${learnerCourseRoot}/learn/lesson-customer-journey`, description: "Readable lesson content and compact path navigation" },
      { label: "Completed Lesson", href: `${learnerCourseRoot}/learn?state=completed`, description: "Completed status, saved progress, and next activity" },
      { label: "Missing Lesson", href: `${learnerCourseRoot}/learn/missing-lesson`, description: "Unavailable activity recovery state" },
    ],
  },
  {
    functionId: "13",
    title: "Quiz / Post-Assessment",
    routes: [
      { label: "Quick Quiz", href: `${learnerCourseRoot}/quiz/quick-quiz-customer-journey?view=question`, description: "Lesson knowledge check with validation" },
      { label: "Quick Quiz Result", href: `${learnerCourseRoot}/quiz/quick-quiz-customer-journey?view=result&result=passed`, description: "Score, exact-answer count, feedback, and continuation" },
      { label: "Post-Assessment Entry", href: `${learnerCourseRoot}/post-assessment?view=intro`, description: "Final knowledge-check context and start action" },
      { label: "Post-Assessment Questions", href: `${learnerCourseRoot}/post-assessment?view=question`, description: "Final eight-question knowledge check" },
      { label: "Post-Assessment Submitting", href: `${learnerCourseRoot}/post-assessment?view=submitting`, description: "Saved submission handoff before analysis" },
      { label: "Post-Assessment Analysis", href: `${learnerCourseRoot}/post-assessment?view=analyzing`, description: "Staged comparison and passing-criteria analysis" },
      { label: "Passed Result", href: `${learnerCourseRoot}/post-assessment?view=result&result=passed`, description: "Before/after score comparison" },
      { label: "Needs Practice", href: `${learnerCourseRoot}/post-assessment?view=result&result=needs-practice`, description: "Failed criteria and retry path" },
    ],
  },
  {
    functionId: "14",
    title: "Practical Assessment",
    routes: [
      { label: "Practical Task", href: `${learnerCourseRoot}/practical-assessment?state=task`, description: "Empty structured campaign-plan task and rubric" },
      { label: "Saved Draft", href: `${learnerCourseRoot}/practical-assessment?state=draft`, description: "Persisted structured response ready to continue" },
      { label: "Evaluation", href: `${learnerCourseRoot}/practical-assessment?state=evaluating`, description: "Meaningful rubric evaluation stages" },
      { label: "Passed Result", href: `${learnerCourseRoot}/practical-assessment?state=passed`, description: "Rubric score and captured evidence" },
      { label: "Needs Practice", href: `${learnerCourseRoot}/practical-assessment?state=needs-practice`, description: "Improvement feedback and retry" },
    ],
  },
  {
    functionId: "15",
    title: "Skill Result & Feedback",
    routes: [
      { label: "Completed Result", href: `${learnerCourseRoot}/result?state=completed`, description: "Competency, improvement, evidence, and verification" },
      { label: "More Practice Result", href: `${learnerCourseRoot}/result?state=more-practice`, description: "Incomplete verification and recommended next steps" },
    ],
  },
  {
    functionId: "16",
    title: "Skill Evidence / Portfolio / Credential",
    routes: [
      { label: "Portfolio Overview", href: `${learnerCourseRoot}/skill-evidence?state=issued`, description: "Derived summary, recent evidence, and credential status" },
      { label: "Skills", href: `${learnerCourseRoot}/skill-evidence?tab=skills&state=issued`, description: "Verified and developing skill records" },
      { label: "Verified Skill Detail", href: `${learnerCourseRoot}/skill-evidence/skills/skill-customer-journey?state=issued`, description: "Improvement, evidence mapping, and rubric traceability" },
      { label: "Incomplete Evidence", href: `${learnerCourseRoot}/skill-evidence/skills/skill-customer-journey?state=partial`, description: "Why a skill is not yet Verified and the next action" },
      { label: "Evidence", href: `${learnerCourseRoot}/skill-evidence?tab=evidence&state=issued`, description: "Assessment and learning evidence records" },
      { label: "Practical Evidence Result", href: `${learnerCourseRoot}/practical-assessment?state=passed`, description: "Stored rubric evidence linked from the portfolio" },
      { label: "Credential Claim", href: `${learnerCourseRoot}/skill-evidence/credentials/SS-DEMO-2026-999?state=eligible`, description: "Eligible credential with simulated local issuance" },
      { label: "Issued Credential", href: `${learnerCourseRoot}/skill-evidence/credentials/SS-DEMO-2026-999?state=issued`, description: "Professional credential preview and sharing actions" },
      { label: "Credential Eligible", href: `${learnerCourseRoot}/skill-evidence?tab=credentials&state=eligible`, description: "Requirements complete before simulated issuance" },
      { label: "Credential Requirements", href: `${learnerCourseRoot}/skill-evidence/requirements?state=partial`, description: "Incomplete requirement checklist" },
      { label: "Certificate Disabled", href: `${learnerCourseRoot}/skill-evidence?tab=credentials&state=certificate-disabled`, description: "Evidence retained when a certificate is not offered" },
      { label: "Empty Portfolio", href: `${learnerCourseRoot}/skill-evidence?state=empty`, description: "First-time learner evidence empty state" },
    ],
  },
  {
    functionId: "17",
    title: "Creator Dashboard & Analytics",
    routes: [
      { label: "Creator Dashboard", href: "/creator", description: "Course, learner, completion, and lifecycle overview" },
      { label: "Analytics Overview", href: "/creator/analytics", description: "KPIs, learner funnel, course comparison, skills, content, and insights" },
      { label: "Course Analytics", href: "/creator/analytics/digital-marketing-foundations", description: "Published-course performance detail" },
      { label: "No Learner Activity", href: "/creator/analytics/ai-productivity-basics", description: "Published course before learners begin" },
      { label: "Empty Analytics", href: "/creator/analytics?state=empty", description: "Creator workspace without a published course" },
      { label: "Loading Analytics", href: "/creator/analytics?state=loading", description: "Accessible loading state" },
      { label: "Analytics Error", href: "/creator/analytics?state=error", description: "Safe error and retry behavior" },
    ],
  },
  {
    functionId: "18",
    title: "Organization",
    routes: [
      { label: "Organization Overview", href: "/organization", description: "Workspace metrics, course activity, recent learning, and skill development" },
      { label: "Organization Courses", href: "/organization/courses", description: "Lifecycle-aware organization course catalog and working filters" },
      { label: "Course Performance", href: "/organization/courses/digital-marketing-foundations", description: "Organization-scoped funnel, assessment, skill, and content outcomes" },
      { label: "No Learner Activity", href: "/organization/courses/ai-productivity-basics", description: "Published course before learners begin" },
      { label: "Organization Learners", href: "/organization/learners", description: "Learning-only learner progress overview" },
      { label: "Learner Detail", href: "/organization/learners/learner-maya-chen", description: "Current learning, completed courses, verified skills, and recent activity" },
      { label: "Skills & Outcomes", href: "/organization/skills", description: "Aggregate improvement, coverage, and attention signals" },
      { label: "Empty Organization", href: "/organization?state=empty", description: "Workspace before courses or learner evidence exist" },
      { label: "No Learners", href: "/organization/learners?state=empty", description: "Workspace learner empty state" },
      { label: "Loading Organization", href: "/organization?state=loading", description: "Accessible persistent loading state" },
      { label: "Organization Error", href: "/organization?state=error", description: "Safe error and retry behavior" },
    ],
  },
  {
    functionId: "19",
    title: "Admin",
    routes: [
      { label: "Enter Admin Preview", href: "/dev/frontend-preview/admin?destination=%2Fadmin", description: "Creates an explicit development-only Admin role session" },
      { label: "Admin Overview", href: "/dev/frontend-preview/admin?destination=%2Fadmin", description: "Platform users, courses, and recent oversight activity" },
      { label: "Users", href: "/dev/frontend-preview/admin?destination=%2Fadmin%2Fusers", description: "Working account-type filters and read-only account context" },
      { label: "User Detail", href: "/dev/frontend-preview/admin?destination=%2Fadmin%2Fusers%2Fuser-3", description: "Workspace, role, and SkillSync activity summary" },
      { label: "Courses", href: "/dev/frontend-preview/admin?destination=%2Fadmin%2Fcourses", description: "Lifecycle-aware platform course oversight" },
      { label: "Course Detail", href: "/dev/frontend-preview/admin?destination=%2Fadmin%2Fcourses%2Fdigital-marketing-foundations", description: "Read-only learning activity and outcome detail" },
      { label: "Platform Activity", href: "/dev/frontend-preview/admin?destination=%2Fadmin%2Factivity", description: "Deterministic account, course, and organization events" },
      { label: "Empty Admin", href: "/dev/frontend-preview/admin?destination=%2Fadmin%3Fstate%3Dempty", description: "No platform records state" },
      { label: "Loading Admin", href: "/dev/frontend-preview/admin?destination=%2Fadmin%3Fstate%3Dloading", description: "Accessible persistent loading state" },
      { label: "Admin Error", href: "/dev/frontend-preview/admin?destination=%2Fadmin%3Fstate%3Derror", description: "Safe error and retry behavior" },
    ],
  },
  {
    functionId: "20",
    title: "Notifications / Reports / Supporting States",
    routes: [
      { label: "Notifications", href: "/notifications", description: "Role-aware updates with valid SkillSync destinations" },
      { label: "Unread Notifications", href: "/notifications?filter=unread", description: "Unread filtering and persisted read state" },
      { label: "No Notifications", href: "/notifications?state=empty", description: "All-caught-up notification state" },
      { label: "Notification Loading", href: "/notifications?state=loading", description: "Accessible notification loading announcement" },
      { label: "Notification Error", href: "/notifications?state=error", description: "Safe notification error and Retry" },
      { label: "Creator CSV Report", href: "/creator/analytics", description: "Course performance export using active filters" },
      { label: "Organization CSV Report", href: "/organization/skills", description: "Filtered aggregate skill outcome export" },
      { label: "Admin CSV Report", href: "/dev/frontend-preview/admin?destination=%2Fadmin%2Fcourses", description: "Lifecycle-filtered platform course export" },
      { label: "Shared State Index", href: "/dev/frontend-preview/supporting-states", description: "Loading, empty, error, feedback, confirmation, disabled, and invalid states" },
      { label: "Generic Loading", href: "/dev/frontend-preview/supporting-states?view=loading", description: "Shared accessible loading pattern" },
      { label: "Generic Empty", href: "/dev/frontend-preview/supporting-states?view=empty", description: "Meaningful empty state and valid action" },
      { label: "Generic Error / Retry", href: "/dev/frontend-preview/supporting-states?view=error", description: "Shared recovery pattern" },
      { label: "Confirmation Dialog", href: "/dev/frontend-preview/supporting-states?view=confirmation", description: "Focus-managed confirmation behavior" },
      { label: "Disabled CTA Reason", href: "/dev/frontend-preview/supporting-states?view=disabled", description: "Unavailable action with associated explanation" },
      { label: "Invalid Entity", href: "/dev/frontend-preview/supporting-states?view=invalid", description: "Friendly invalid-link recovery" },
      { label: "Global Not Found", href: "/this-route-does-not-exist", description: "Application-level 404 recovery" },
    ],
  },
];

export const frontendPreviewCourseId = FRONTEND_PREVIEW_COURSE_ID;
