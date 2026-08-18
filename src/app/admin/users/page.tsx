import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { AdminLoading } from "@/features/admin/components/admin-states";
import { AdminUsers } from "@/features/admin/components/admin-users";

export const metadata: Metadata = { title: "Admin users" };

export default function AdminUsersPage() {
  return <Suspense fallback={<ContentContainer><AdminLoading label="Loading platform users" /></ContentContainer>}><AdminUsers /></Suspense>;
}
