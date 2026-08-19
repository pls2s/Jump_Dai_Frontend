import type { UserRole, WorkspaceType } from "@/data/mock";
import { apiRequest } from "@/lib/api/api-client";

export type ApiAdminRole = "LEARNER" | "CREATOR" | "ADMIN";

interface BackendAdminUser {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  workspace_type: WorkspaceType | null;
  roles: ApiAdminRole[];
  onboarding_completed: boolean;
  is_active: boolean;
}

export interface ApiAdminUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  workspaceType: WorkspaceType | null;
  roles: UserRole[];
  onboardingCompleted: boolean;
  isActive: boolean;
}

function toApiAdminUser(user: BackendAdminUser): ApiAdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.email_verified,
    workspaceType: user.workspace_type,
    roles: user.roles.map((role) => role.toLowerCase() as UserRole),
    onboardingCompleted: user.onboarding_completed,
    isActive: user.is_active,
  };
}

/** List the accounts the authenticated Admin is permitted to manage. */
export async function getApiAdminUsers(accessToken: string): Promise<ApiAdminUser[]> {
  const users = await apiRequest<BackendAdminUser[]>("/api/users", {
    method: "GET",
    token: accessToken,
  });
  return users.map(toApiAdminUser);
}

/** Replace one account's application roles from the Admin console. */
export async function updateApiAdminUserRoles(
  userId: number,
  roles: UserRole[],
  accessToken: string,
): Promise<ApiAdminUser> {
  const user = await apiRequest<BackendAdminUser>(`/api/users/${userId}/roles`, {
    method: "PUT",
    token: accessToken,
    body: { roles: roles.map((role) => role.toUpperCase()) },
  });
  return toApiAdminUser(user);
}

/** Suspend or reactivate one account without deleting its data. */
export async function updateApiAdminUserStatus(
  userId: number,
  isActive: boolean,
  accessToken: string,
): Promise<ApiAdminUser> {
  const user = await apiRequest<BackendAdminUser>(`/api/users/${userId}/status`, {
    method: "PATCH",
    token: accessToken,
    body: { is_active: isActive },
  });
  return toApiAdminUser(user);
}
