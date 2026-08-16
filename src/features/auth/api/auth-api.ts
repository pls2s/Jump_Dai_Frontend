import { apiRequest } from "@/lib/api/api-client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface AuthResult {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface RegistrationResult {
  id: number;
  name: string;
  email: string;
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const data = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: input,
  });
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    user: data.user,
  };
}

export function register(input: { name: string; email: string; password: string }) {
  return apiRequest<RegistrationResult>("/api/auth/register", {
    method: "POST",
    body: input,
  });
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<AuthUser>("/api/auth/me", {
    method: "GET",
    token: accessToken,
  });
}
