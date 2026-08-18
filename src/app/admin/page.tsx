import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { AdminOverview } from "@/features/admin/components/admin-overview";
import { AdminLoading } from "@/features/admin/components/admin-states";

export const metadata: Metadata = { title: "Admin overview" };

export default function AdminPage() {
  return <Suspense fallback={<ContentContainer><AdminLoading /></ContentContainer>}><AdminOverview /></Suspense>;
}
