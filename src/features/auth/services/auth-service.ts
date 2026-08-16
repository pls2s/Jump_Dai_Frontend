import {
  AUTH_DEMO_ACCOUNTS,
  FRONTEND_DEMO_OTP,
  type UserRole,
  type WorkspaceType,
} from "@/data/mock";
import { isFrontendDemoMode } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";
import { getCurrentUser, login, register, type AuthUser } from "../api/auth-api";
import {
  clearPendingDemoRegistration,
  getAuthSession,
  getPendingDemoRegistration,
  routeForWorkspace,
  saveApiAuthSession,
  saveAuthSession,
  savePendingDemoRegistration,
  type AuthSession,
} from "../lib/auth-session";

export class AuthFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthFlowError";
  }
}

function demoUserSession(workspaceType: WorkspaceType): AuthSession {
  const account = AUTH_DEMO_ACCOUNTS.find((user) => user.workspaceType === workspaceType);
  if (!account) throw new AuthFlowError("This demo account is unavailable.");
  return {
    mode: "demo",
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      workspaceType: account.workspaceType,
      roles: account.roles,
    },
  };
}

export async function signIn(input: { email: string; password: string; remember: boolean }) {
  if (isFrontendDemoMode) {
    await demoDelay(450);
    const account = AUTH_DEMO_ACCOUNTS.find(
      (user) => user.email.toLowerCase() === input.email.trim().toLowerCase() && user.password === input.password,
    );
    if (!account) throw new AuthFlowError("Email or password is incorrect.");
    const session = demoUserSession(account.workspaceType);
    saveAuthSession(session, true);
    return { session, destination: routeForWorkspace(account.workspaceType) };
  }

  const result = await login({ email: input.email, password: input.password });
  saveApiAuthSession(result, input.remember);
  return { session: getAuthSession()!, destination: "/creator" };
}

export async function enterDemoWorkspace(workspaceType: WorkspaceType) {
  if (!isFrontendDemoMode) throw new AuthFlowError("Frontend Demo Mode is disabled.");
  await demoDelay(220);
  const session = demoUserSession(workspaceType);
  saveAuthSession(session, true);
  return routeForWorkspace(workspaceType);
}

export async function createAccount(input: { name: string; email: string; password: string }) {
  if (isFrontendDemoMode) {
    await demoDelay(500);
    savePendingDemoRegistration({ name: input.name, email: input.email });
    return "/verify-otp";
  }
  await register(input);
  return "/sign-in?registered=1";
}

export async function verifyRegistrationOtp(code: string) {
  if (!isFrontendDemoMode) throw new AuthFlowError("OTP verification is not available in API mode.");
  const registration = getPendingDemoRegistration();
  if (!registration) throw new AuthFlowError("Your registration session is missing. Create your account again.");
  await demoDelay(400);
  if (code !== FRONTEND_DEMO_OTP) throw new AuthFlowError("The verification code is incorrect.");
  savePendingDemoRegistration({ ...registration, verified: true });
  return "/account-type";
}

export async function completeDemoRegistration(workspaceType: WorkspaceType) {
  if (!isFrontendDemoMode) throw new AuthFlowError("Workspace selection is not available in API mode.");
  const registration = getPendingDemoRegistration();
  if (!registration?.verified) throw new AuthFlowError("Verify your email before choosing a workspace.");
  await demoDelay(350);
  const roles: UserRole[] = workspaceType === "learner" ? ["learner"] : ["creator"];
  const session: AuthSession = {
    mode: "demo",
    user: {
      id: Date.now(),
      name: registration.name,
      email: registration.email,
      workspaceType,
      roles,
    },
  };
  saveAuthSession(session, true);
  clearPendingDemoRegistration();
  return routeForWorkspace(workspaceType);
}

export async function loadCurrentAccount(): Promise<AuthUser> {
  const session = getAuthSession();
  if (!session) throw new AuthFlowError("Your session has ended. Sign in again.");
  if (session.mode === "demo") {
    await demoDelay(250);
    return { id: session.user.id, name: session.user.name, email: session.user.email };
  }
  return getCurrentUser(session.accessToken);
}
