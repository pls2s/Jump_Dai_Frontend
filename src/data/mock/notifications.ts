import type { SkillSyncNotificationDefinition } from "@/features/notifications/types";

const courseId = "digital-marketing-foundations";

export const notificationFixtures: SkillSyncNotificationDefinition[] = [
  { id: "creator-generation-complete", audience: "creator", kind: "course", title: "Course generation completed", message: "Digital Marketing Foundations is ready for your review.", createdAt: "2026-08-18T08:40:00+07:00", destination: `/creator/courses/${courseId}/generated` },
  { id: "creator-review-ready", audience: "creator", kind: "course", title: "Course ready for review", message: "Review the generated lessons and verify their source grounding.", createdAt: "2026-08-18T07:55:00+07:00", destination: `/creator/courses/${courseId}/review` },
  { id: "creator-course-published", audience: "creator", kind: "course", title: "Course published", message: "Digital Marketing Foundations is available in the frontend prototype.", createdAt: "2026-08-17T15:20:00+07:00", destination: `/creator/courses/${courseId}/published` },
  { id: "creator-course-completion", audience: "creator", kind: "assessment", title: "Learners completed your course", message: "Review the latest completion and skill outcome metrics.", createdAt: "2026-08-16T11:10:00+07:00", destination: `/creator/analytics/${courseId}` },

  { id: "learner-path-ready", audience: "learner", kind: "learning", title: "Your learning path is ready", message: "Your priorities and preferred activity formats are ready to review.", createdAt: "2026-08-18T08:30:00+07:00", destination: `/learner/courses/${courseId}/learning-path?view=result` },
  { id: "learner-result-ready", audience: "learner", kind: "assessment", title: "Your skill result is ready", message: "See your improvement and applied assessment feedback.", createdAt: "2026-08-17T16:05:00+07:00", destination: `/learner/courses/${courseId}/result?state=completed` },
  { id: "learner-credential-earned", audience: "learner", kind: "credential", title: "Credential earned", message: "Your SkillSync demo credential and supporting evidence are available.", createdAt: "2026-08-17T16:10:00+07:00", destination: `/learner/courses/${courseId}/skill-evidence?tab=credentials&state=issued` },

  { id: "organization-course-update", audience: "organization", kind: "organization", title: "Course activity update", message: "Digital Marketing Foundations now has 118 recorded completions.", createdAt: "2026-08-18T09:05:00+07:00", destination: `/organization/courses/${courseId}` },
  { id: "organization-outcome-update", audience: "organization", kind: "organization", title: "Learning outcomes updated", message: "New aggregate skill evidence is available for your workspace.", createdAt: "2026-08-17T14:20:00+07:00", destination: "/organization/skills" },

  { id: "admin-course-published", audience: "admin", kind: "platform", title: "Course published", message: "Creator Demo published Digital Marketing Foundations.", createdAt: "2026-08-18T09:42:00+07:00", destination: `/admin/courses/${courseId}` },
  { id: "admin-creator-joined", audience: "admin", kind: "platform", title: "Creator account registered", message: "Maya Rodriguez joined the Creator workspace.", createdAt: "2026-08-17T10:00:00+07:00", destination: "/admin/users/creator-maya-rodriguez" },
];
