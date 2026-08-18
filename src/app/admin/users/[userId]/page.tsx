import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { AdminLoading } from "@/features/admin/components/admin-states";
import { AdminUserDetail } from "@/features/admin/components/admin-users";

export const metadata: Metadata = { title: "Admin user detail" };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <Suspense fallback={<ContentContainer><AdminLoading label="Loading user account" /></ContentContainer>}><AdminUserDetail userId={userId} /></Suspense>;
}
