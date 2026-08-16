import type { ReactNode } from "react";
import { LearnerShell } from "@/features/learner/components/learner-shell";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return <LearnerShell>{children}</LearnerShell>;
}
