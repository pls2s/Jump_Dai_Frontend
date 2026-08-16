export type WorkspaceType = "learner" | "creator" | "organization";

export type UserRole = "learner" | "creator" | "admin";

export interface MockAuthUser {
  id: number;
  name: string;
  email: string;
  password: string;
  workspaceType: WorkspaceType;
  roles: UserRole[];
}

/**
 * Development fixtures mirrored from the backend seed data.
 * These credentials must never be used in production.
 */
export const MOCK_AUTH_USERS: MockAuthUser[] = [
  {
    id: 1,
    name: "Learner Demo",
    email: "demo@skillsync.local",
    password: "password123",
    workspaceType: "learner",
    roles: ["learner"],
  },
  {
    id: 2,
    name: "Creator Demo",
    email: "creator@skillsync.local",
    password: "password123",
    workspaceType: "creator",
    roles: ["creator"],
  },
  {
    id: 3,
    name: "Organization Demo",
    email: "organization@skillsync.local",
    password: "password123",
    workspaceType: "organization",
    roles: ["creator"],
  },
];

export function getDemoAccountByWorkspace(workspaceType: WorkspaceType) {
  return MOCK_AUTH_USERS.find((user) => user.workspaceType === workspaceType);
}
