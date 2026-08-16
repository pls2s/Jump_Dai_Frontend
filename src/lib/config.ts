/**
 * Development-only escape hatch for reviewing frontend routes without auth.
 * Missing or non-"true" values deliberately keep the bypass disabled.
 */
export const isFrontendBypassEnabled =
  process.env.NEXT_PUBLIC_FRONTEND_BYPASS === "true";

export const isFrontendDemoMode =
  process.env.NEXT_PUBLIC_FRONTEND_DEMO_MODE === "true";

/** Use local frontend services without disturbing the preserved API client path. */
export const shouldUseFrontendMocks =
  isFrontendBypassEnabled || isFrontendDemoMode;
