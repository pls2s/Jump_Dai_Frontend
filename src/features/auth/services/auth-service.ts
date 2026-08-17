import {
  AUTH_DEMO_ACCOUNTS,
  FRONTEND_DEMO_OTP,
  FRONTEND_DEMO_OTP_TTL_SECONDS,
  type UserRole,
  type WorkspaceType,
} from "@/data/mock";
import { isFrontendBypassEnabled, shouldUseFrontendMocks } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";
import { getCurrentUser, login, register, type AuthUser } from "../api/auth-api";
import {
  clearPendingDemoRegistration,
  getAuthSession,
  getPendingDemoRegistration,
  routeForWorkspace,
  createFrontendBypassSession,
  saveFrontendBypassSession,
  saveApiAuthSession,
  saveAuthSession,
  savePendingDemoRegistration,
  updateStoredSessionProfile,
  type AuthSession,
} from "../lib/auth-session";

export class AuthFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthFlowError";
  }
}

export interface DemoOtpContext {
  email: string;
  expiresAt: number;
}

function nextDemoOtpExpiry() {
  return Date.now() + FRONTEND_DEMO_OTP_TTL_SECONDS * 1000;
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
  if (isFrontendBypassEnabled) {
    await demoDelay(140);
    const session = createFrontendBypassSession("creator", input.email);
    saveAuthSession(session, true);
    return { session, destination: "/creator" };
  }

  if (shouldUseFrontendMocks) {
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
  if (!shouldUseFrontendMocks) throw new AuthFlowError("Frontend Demo Mode is disabled.");
  if (isFrontendBypassEnabled) return enterFrontendPreview(workspaceType);
  await demoDelay(220);
  const session = demoUserSession(workspaceType);
  saveAuthSession(session, true);
  return routeForWorkspace(workspaceType);
}

export async function enterFrontendPreview(workspaceType: WorkspaceType = "creator") {
  if (!isFrontendBypassEnabled) throw new AuthFlowError("Frontend Bypass Mode is disabled.");
  await demoDelay(180);
  saveFrontendBypassSession(workspaceType);
  return routeForWorkspace(workspaceType);
}

export async function createAccount(input: { name: string; email: string; password: string }) {
  if (shouldUseFrontendMocks) {
    await demoDelay(500);
    savePendingDemoRegistration({ name: input.name, email: input.email, otpExpiresAt: nextDemoOtpExpiry() });
    return "/verify-otp";
  }
  await register(input);
  return "/sign-in?registered=1";
}

export async function verifyRegistrationOtp(code: string) {
  if (!shouldUseFrontendMocks) throw new AuthFlowError("OTP verification is not available in API mode.");
  const registration = getPendingDemoRegistration();
  if (!registration) throw new AuthFlowError("Your registration session is missing. Create your account again.");
  await demoDelay(400);
  if (!registration.otpExpiresAt || registration.otpExpiresAt <= Date.now()) {
    throw new AuthFlowError("This verification code has expired. Resend the code to continue.");
  }
  if (code !== FRONTEND_DEMO_OTP) throw new AuthFlowError("The verification code is incorrect.");
  savePendingDemoRegistration({ ...registration, verified: true });
  return "/account-type";
}

export function getDemoOtpContext(): DemoOtpContext | null {
  if (!shouldUseFrontendMocks) return null;
  const registration = getPendingDemoRegistration();
  if (!registration) return null;
  if (registration.otpExpiresAt) {
    return { email: registration.email, expiresAt: registration.otpExpiresAt };
  }
  const expiresAt = nextDemoOtpExpiry();
  savePendingDemoRegistration({ ...registration, otpExpiresAt: expiresAt });
  return { email: registration.email, expiresAt };
}

export async function resendRegistrationOtp(): Promise<DemoOtpContext> {
  if (!shouldUseFrontendMocks) throw new AuthFlowError("OTP resend is not available in API mode.");
  const registration = getPendingDemoRegistration();
  if (!registration) throw new AuthFlowError("Your registration session is missing. Create your account again.");
  await demoDelay(450);
  const expiresAt = nextDemoOtpExpiry();
  savePendingDemoRegistration({ ...registration, verified: false, otpExpiresAt: expiresAt });
  return { email: registration.email, expiresAt };
}

export async function completeDemoRegistration(workspaceType: WorkspaceType) {
  if (!shouldUseFrontendMocks) throw new AuthFlowError("Workspace selection is not available in API mode.");
  if (isFrontendBypassEnabled) return enterFrontendPreview(workspaceType);
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
  if (session.mode === "demo" || session.mode === "bypass") {
    await demoDelay(250);
    return { id: session.user.id, name: session.user.name, email: session.user.email };
  }
  return getCurrentUser(session.accessToken);
}

export async function updateCurrentAccount(input: { name: string; email: string }): Promise<AuthUser> {
  const session = getAuthSession();
  if (!session) throw new AuthFlowError("Your session has ended. Sign in again.");
  if (session.mode === "api") {
    throw new AuthFlowError("Profile editing is waiting for a documented backend endpoint.");
  }
  await demoDelay(350);
  const updated = updateStoredSessionProfile({ name: input.name.trim(), email: input.email.trim() });
  if (!updated) throw new AuthFlowError("Your session has ended. Sign in again.");
  return { id: updated.user.id, name: updated.user.name, email: updated.user.email };
}
