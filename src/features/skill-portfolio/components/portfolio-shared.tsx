import { CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";

import { Badge, type BadgeVariant } from "@/components/ui";
import type {
  CredentialStatus,
  PortfolioPreviewState,
} from "@/features/skill-portfolio/types";
import type { SkillVerificationStatus } from "@/features/learner-journey/types";

const skillLabels: Record<SkillVerificationStatus, string> = {
  developing: "Developing",
  proficient: "Proficient",
  verified: "Verified",
  "needs-more-practice": "Needs more practice",
};

const skillVariants: Record<SkillVerificationStatus, BadgeVariant> = {
  developing: "info",
  proficient: "accent",
  verified: "success",
  "needs-more-practice": "warning",
};

const credentialLabels: Record<CredentialStatus, string> = {
  "not-eligible": "Not eligible",
  eligible: "Eligible",
  issued: "Issued",
  revoked: "Revoked",
};

export function SkillStatusBadge({ status }: { status: SkillVerificationStatus }) {
  return <Badge variant={skillVariants[status]}>{status === "verified" && <ShieldCheck className="size-3.5" aria-hidden="true" />}{skillLabels[status]}</Badge>;
}

export function CredentialStatusBadge({ status }: { status: CredentialStatus }) {
  return <Badge variant={status === "issued" ? "success" : status === "eligible" ? "accent" : status === "revoked" ? "error" : "warning"}>{credentialLabels[status]}</Badge>;
}

export function RequirementMark({ met }: { met: boolean }) {
  return met
    ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-success" aria-hidden="true" />
    : <CircleDashed className="mt-0.5 size-5 shrink-0 text-text-tertiary" aria-hidden="true" />;
}

export function formatPortfolioDate(value?: string) {
  if (!value) return "Not issued";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function previewQuery(state: PortfolioPreviewState) {
  return state === "default" ? "" : `?state=${state}`;
}

export function appendPreviewState(path: string, state: PortfolioPreviewState) {
  if (state === "default") return path;
  return `${path}${path.includes("?") ? "&" : "?"}state=${state}`;
}
