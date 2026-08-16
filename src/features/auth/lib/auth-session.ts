import type { UserRole, WorkspaceType } from "@/data/mock";
import { isFrontendDemoMode } from "@/lib/config";
import type { AuthResult } from "../api/auth-api";

const SESSION_KEY = "skillsync-auth-session";
const PENDING_REGISTRATION_KEY = "skillsync-demo-pending-registration";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  workspaceType?: WorkspaceType;
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
    };

export interface PendingDemoRegistration {
  name: string;
  email: string;
  verified?: boolean;
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

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
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

export function routeForWorkspace(workspaceType: WorkspaceType) {
  const routes: Record<WorkspaceType, string> = {
    creator: "/creator",
    learner: "/learner/onboarding",
    organization: "/organization/onboarding",
  };
  return routes[workspaceType];
}
