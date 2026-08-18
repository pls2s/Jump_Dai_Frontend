import type { AdminActivityRecord, AdminUserRecord } from "@/features/admin/types";

/** Platform oversight fixtures. These are not login credentials. */
export const adminUsers: AdminUserRecord[] = [
  { id: "user-1", name: "Learner Demo", email: "demo@skillsync.local", workspaceType: "learner", roles: ["learner"], activitySummary: "Digital Marketing Foundations · learning in progress", joinedLabel: "Joined 3 months ago" },
  { id: "user-2", name: "Creator Demo", email: "creator@skillsync.local", workspaceType: "creator", roles: ["creator"], activitySummary: "5 courses · 2 published", joinedLabel: "Joined 5 months ago" },
  { id: "user-3", name: "Organization Demo", email: "organization@skillsync.local", workspaceType: "organization", roles: ["creator"], activitySummary: "SkillSync Demo Organization · 2 active courses", joinedLabel: "Joined 4 months ago" },
  { id: "learner-maya-chen", name: "Maya Chen", email: "maya.chen@example.test", workspaceType: "learner", roles: ["learner"], activitySummary: "1 completed course · 3 verified skills", joinedLabel: "Joined 10 weeks ago" },
  { id: "learner-noah-williams", name: "Noah Williams", email: "noah.williams@example.test", workspaceType: "learner", roles: ["learner"], activitySummary: "1 course in progress · practical submitted", joinedLabel: "Joined 8 weeks ago" },
  { id: "creator-maya-rodriguez", name: "Maya Rodriguez", email: "maya.rodriguez@example.test", workspaceType: "creator", roles: ["creator"], activitySummary: "1 course in review", joinedLabel: "Joined 7 months ago" },
  { id: "admin-platform-1", name: "Platform Admin", email: "admin@skillsync.local", workspaceType: null, roles: ["admin"], activitySummary: "Platform oversight access", joinedLabel: "System assigned" },
];

export const adminActivity: AdminActivityRecord[] = [
  { id: "activity-publish-dmf", type: "course", title: "Course published", description: "Creator Demo published Digital Marketing Foundations.", occurredAt: "Today, 09:42" },
  { id: "activity-organization-learning", type: "organization", title: "Organization learning activity", description: "SkillSync Demo Organization recorded 12 new verified skill outcomes.", occurredAt: "Today, 08:15" },
  { id: "activity-creator-registration", type: "account", title: "Creator account registered", description: "Maya Rodriguez joined the Creator workspace.", occurredAt: "Yesterday" },
  { id: "activity-review", type: "course", title: "Course moved to review", description: "Customer Experience Essentials entered Creator review.", occurredAt: "2 days ago" },
  { id: "activity-org-course", type: "organization", title: "Organization course activity", description: "82 learners participated in Digital Marketing Foundations.", occurredAt: "3 days ago" },
];
