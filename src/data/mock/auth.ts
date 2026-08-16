import { MOCK_AUTH_USERS } from "./auth-users";

/** Development/demo fixtures. Only the centralized demo auth service may validate against them. */
export const AUTH_DEMO_ACCOUNTS = MOCK_AUTH_USERS;

/** Development-only OTP used only when Frontend Demo Mode is enabled. */
export const FRONTEND_DEMO_OTP = "123456";
