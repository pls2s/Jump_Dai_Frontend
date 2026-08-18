import type { UserRole, WorkspaceType } from "@/data/mock";
import { apiRequest } from "@/lib/api/api-client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  workspaceType: WorkspaceType | null;
  roles: UserRole[];
  onboardingCompleted: boolean;
}

export type AuthNextStep = "email_verification" | "workspace_selection" | "complete";

interface BackendAuthUser {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  workspace_type: WorkspaceType | null;
  roles: Array<"LEARNER" | "CREATOR">;
  onboarding_completed: boolean;
}

interface BackendAuthResult {
  access_token: string;
  token_type: string;
  user: BackendAuthUser;
  next_step: AuthNextStep;
}

export interface AuthResult {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
  nextStep: AuthNextStep;
}

export interface RegistrationResult {
  user: AuthUser;
  nextStep: "email_verification";
  mockVerificationCode: string;
}

function toAuthUser(user: BackendAuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.email_verified,
    workspaceType: user.workspace_type,
    roles: user.roles.map((role) => role.toLowerCase() as UserRole),
    onboardingCompleted: user.onboarding_completed,
  };
}

function toAuthResult(data: BackendAuthResult): AuthResult {
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    user: toAuthUser(data.user),
    nextStep: data.next_step,
  };
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const data = await apiRequest<BackendAuthResult>("/api/auth/login", {
    method: "POST",
    body: input,
  });
  return toAuthResult(data);
}

export async function register(input: { name: string; email: string; password: string }): Promise<RegistrationResult> {
  const data = await apiRequest<{
    user: BackendAuthUser;
    next_step: "email_verification";
    mock_verification_code: string;
  }>("/api/auth/register", {
    method: "POST",
    body: input,
  });
  return {
    user: toAuthUser(data.user),
    nextStep: data.next_step,
    mockVerificationCode: data.mock_verification_code,
  };
}

export async function verifyEmail(input: { email: string; code: string }): Promise<AuthResult> {
  const data = await apiRequest<BackendAuthResult>("/api/auth/verify-email", {
    method: "POST",
    body: input,
  });
  return toAuthResult(data);
}

export function resendVerification(input: { email: string }) {
  return apiRequest<{ message: string; mock_verification_code: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: input,
  });
}

export async function selectWorkspace(accessToken: string, workspaceType: WorkspaceType): Promise<AuthUser> {
  const data = await apiRequest<{ user: BackendAuthUser; next_step: "complete" }>("/api/auth/workspace", {
    method: "POST",
    token: accessToken,
    body: { workspace_type: workspaceType },
  });
  return toAuthUser(data.user);
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const data = await apiRequest<BackendAuthUser>("/api/auth/me", {
    method: "GET",
    token: accessToken,
  });
  return toAuthUser(data);
}
