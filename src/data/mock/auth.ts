import { MOCK_AUTH_USERS, type UserRole, type WorkspaceType } from "./auth-users";

/** Development/demo fixtures. Only the centralized demo auth service may validate against them. */
export const AUTH_DEMO_ACCOUNTS = MOCK_AUTH_USERS;

/** Development-only OTP used only when Frontend Demo Mode is enabled. */
export const FRONTEND_DEMO_OTP = "123456";

/** Development-only identity synthesized when frontend bypass mode is enabled. */
export const FRONTEND_BYPASS_USER: {
  id: number;
  name: string;
  email: string;
  workspaceType: WorkspaceType;
  roles: UserRole[];
} = {
  id: 999,
  name: "Frontend Preview",
  email: "frontend-preview@skillsync.local",
  workspaceType: "creator",
  roles: ["creator"],
};
