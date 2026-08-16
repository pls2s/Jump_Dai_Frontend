const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

interface ApiSuccess<T> {
  success: true;
  data?: T;
}

interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  token?: string;
  body?: unknown;
  formData?: FormData;
  headers?: HeadersInit;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, body, formData, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch {
    throw new ApiError(
      "We couldn’t reach SkillSync. Check that the backend is running, then try again.",
      undefined,
      "NETWORK_ERROR",
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;
  if (!response.ok || payload?.success === false) {
    const failure = payload?.success === false ? payload : null;
    throw new ApiError(
      failure?.error.message ?? `The request failed with status ${response.status}.`,
      response.status,
      failure?.error.code,
    );
  }

  if (!payload || payload.success !== true) {
    throw new ApiError("The backend returned an unexpected response.", response.status, "INVALID_API_RESPONSE");
  }

  return payload.data as T;
}

export function getApiUrl() {
  return API_URL;
}
