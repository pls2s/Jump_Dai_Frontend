import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { AdminCourses } from "@/features/admin/components/admin-courses";
import { AdminLoading } from "@/features/admin/components/admin-states";

export const metadata: Metadata = { title: "Admin courses" };

export default function AdminCoursesPage() {
  return <Suspense fallback={<ContentContainer><AdminLoading label="Loading platform courses" /></ContentContainer>}><AdminCourses /></Suspense>;
}
