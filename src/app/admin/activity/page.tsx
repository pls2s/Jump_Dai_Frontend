import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { AdminActivity } from "@/features/admin/components/admin-activity";
import { AdminLoading } from "@/features/admin/components/admin-states";

export const metadata: Metadata = { title: "Admin platform activity" };

export default function AdminActivityPage() {
  return <Suspense fallback={<ContentContainer><AdminLoading label="Loading platform activity" /></ContentContainer>}><AdminActivity /></Suspense>;
}
