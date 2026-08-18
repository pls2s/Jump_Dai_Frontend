import { FRONTEND_BYPASS_USER, type UserRole, type WorkspaceType } from "@/data/mock";
import { isFrontendBypassEnabled, isFrontendDemoMode } from "@/lib/config";
import type { AuthResult } from "../api/auth-api";

const SESSION_KEY = "skillsync-auth-session";
const PENDING_REGISTRATION_KEY = "skillsync-demo-pending-registration";
const PENDING_API_REGISTRATION_KEY = "skillsync-api-pending-registration";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  workspaceType?: WorkspaceType | null;
  roles?: UserRole[];
}

export type AuthSession =
  | {
      mode: "api";
      accessToken: string;
      tokenType: string;
      user: SessionUser;
    }
  | {
      mode: "demo";
      user: SessionUser & {
        workspaceType: WorkspaceType;
        roles: UserRole[];
      };
    }
  | {
      mode: "bypass";
      user: SessionUser & {
        workspaceType: WorkspaceType;
        roles: UserRole[];
      };
    };

export interface PendingDemoRegistration {
  name: string;
  email: string;
  verified?: boolean;
  otpExpiresAt?: number;
}

export interface PendingApiRegistration {
  name: string;
  email: string;
  mockVerificationCode?: string;
}

export function saveApiAuthSession(result: AuthResult, remember = true) {
  saveAuthSession({
    mode: "api",
    accessToken: result.accessToken,
    tokenType: result.tokenType,
    user: result.user,
  }, remember);
}

export function saveAuthSession(session: AuthSession, remember = true) {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
  if (isFrontendBypassEnabled) {
    if (raw) {
      try {
        const stored = JSON.parse(raw) as AuthSession;
        if (stored.mode === "bypass") return stored;
      } catch {
        // Invalid development state falls back to the safe preview identity below.
      }
    }
    return createFrontendBypassSession();
  }
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as AuthSession;
    if (isFrontendDemoMode && session.mode !== "demo") return null;
    if (!isFrontendDemoMode && session.mode !== "api") return null;
    return session;
  } catch {
    return null;
  }
}

export function createFrontendBypassSession(
  workspaceType: WorkspaceType = FRONTEND_BYPASS_USER.workspaceType,
  email = FRONTEND_BYPASS_USER.email,
): AuthSession {
  return {
    mode: "bypass",
    user: {
      ...FRONTEND_BYPASS_USER,
      email: email.trim() || FRONTEND_BYPASS_USER.email,
      workspaceType,
      roles: workspaceType === "learner" ? ["learner"] : ["creator"],
    },
  };
}

export function saveFrontendBypassSession(
  workspaceType: WorkspaceType = "creator",
  email = FRONTEND_BYPASS_USER.email,
) {
  const session = createFrontendBypassSession(workspaceType, email);
  saveAuthSession(session, true);
  return session;
}

/**
 * Seeds the system-assigned Admin role only from development preview tooling.
 * Admin remains a role (not a selectable workspace type) in the current model.
 */
export function saveFrontendAdminPreviewSession() {
  const session: AuthSession = {
    mode: "bypass",
    user: {
      id: 999,
      name: "Admin Frontend Preview",
      email: "admin-preview@skillsync.local",
      workspaceType: "creator",
      roles: ["admin"],
    },
  };
  saveAuthSession(session, true);
  return session;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
  sessionStorage.removeItem(PENDING_API_REGISTRATION_KEY);
}

export function savePendingDemoRegistration(registration: PendingDemoRegistration) {
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(registration));
}

export function getPendingDemoRegistration(): PendingDemoRegistration | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingDemoRegistration;
  } catch {
    return null;
  }
}

export function clearPendingDemoRegistration() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}

export function savePendingApiRegistration(registration: PendingApiRegistration) {
  sessionStorage.setItem(PENDING_API_REGISTRATION_KEY, JSON.stringify(registration));
}

export function getPendingApiRegistration(): PendingApiRegistration | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_API_REGISTRATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingApiRegistration;
  } catch {
    return null;
  }
}

export function clearPendingApiRegistration() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_API_REGISTRATION_KEY);
}

export function updateStoredSessionProfile(profile: { name: string; email: string }) {
  const session = getAuthSession();
  if (!session || session.mode === "api") return null;
  const updated: AuthSession = {
    ...session,
    user: { ...session.user, name: profile.name, email: profile.email },
  };
  saveAuthSession(updated, true);
  return updated;
}

export function routeForWorkspace(workspaceType: WorkspaceType) {
  const routes: Record<WorkspaceType, string> = {
    creator: "/creator",
    learner: "/learner",
    organization: "/organization",
  };
  return routes[workspaceType];
}
