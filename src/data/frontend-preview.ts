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
    ],
  },
  {
    functionId: "13",
    title: "Quiz / Post-Assessment",
    routes: [
      { label: "Quick Quiz", href: `${learnerCourseRoot}/quiz/quick-quiz-customer-journey?view=question`, description: "Lesson knowledge check with feedback" },
      { label: "Post-Assessment", href: `${learnerCourseRoot}/post-assessment?view=question`, description: "Final eight-question knowledge check" },
      { label: "Passed Result", href: `${learnerCourseRoot}/post-assessment?view=result&result=passed`, description: "Before/after score comparison" },
      { label: "Needs Practice", href: `${learnerCourseRoot}/post-assessment?view=result&result=needs-practice`, description: "Failed criteria and retry path" },
    ],
  },
  {
    functionId: "14",
    title: "Practical Assessment",
    routes: [
      { label: "Practical Task", href: `${learnerCourseRoot}/practical-assessment`, description: "Structured campaign-plan draft and rubric" },
      { label: "Evaluation", href: `${learnerCourseRoot}/practical-assessment?state=evaluating`, description: "Meaningful rubric evaluation stages" },
      { label: "Passed Result", href: `${learnerCourseRoot}/practical-assessment?state=passed`, description: "Rubric score and captured evidence" },
      { label: "Needs Practice", href: `${learnerCourseRoot}/practical-assessment?state=needs-practice`, description: "Improvement feedback and retry" },
    ],
  },
  {
    functionId: "15",
    title: "Skill Result & Feedback",
    routes: [
      { label: "Skill Result", href: `${learnerCourseRoot}/result`, description: "Competency, improvement, evidence, and verification" },
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
      { label: "Issued Credential", href: `${learnerCourseRoot}/skill-evidence/credentials/SS-DEMO-2026-999?state=issued`, description: "Professional credential preview and sharing actions" },
      { label: "Credential Eligible", href: `${learnerCourseRoot}/skill-evidence?tab=credentials&state=eligible`, description: "Requirements complete before simulated issuance" },
      { label: "Credential Requirements", href: `${learnerCourseRoot}/skill-evidence/requirements?state=partial`, description: "Incomplete requirement checklist" },
      { label: "Certificate Disabled", href: `${learnerCourseRoot}/skill-evidence?tab=credentials&state=certificate-disabled`, description: "Evidence retained when a certificate is not offered" },
      { label: "Empty Portfolio", href: `${learnerCourseRoot}/skill-evidence?state=empty`, description: "First-time learner evidence empty state" },
    ],
  },
];

export const frontendPreviewCourseId = FRONTEND_PREVIEW_COURSE_ID;
