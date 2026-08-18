import type { ReactNode } from "react";

import { OrganizationShell } from "@/features/organization/components/organization-shell";

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  return <OrganizationShell>{children}</OrganizationShell>;
}
