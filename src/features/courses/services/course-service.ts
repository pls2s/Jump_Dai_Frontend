import { mockCourses } from "@/data/mock/product";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { shouldUseFrontendMocks } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";
import { readGeneratedCourseState } from "@/features/course-generation/lib/generated-course-store";
import type { CourseLifecycleStatus } from "@/types/product";
import { createCourse, getCourses, type ApiCourseStatus, type CreateCourseInput } from "../api/course-api";

export interface CourseListItem {
  id: string;
  title: string;
  status: CourseLifecycleStatus;
  destination: string;
  actionLabel: string;
  analyticsHref?: string;
}

function apiLifecycleStatus(status: ApiCourseStatus): CourseLifecycleStatus {
  if (status === "PUBLISHED") return "published";
  if (status === "WAITING_VERIFICATION" || status === "VERIFIED") return "review";
  return "draft";
}

function courseDestination(courseId: string, status: CourseLifecycleStatus) {
  if (status === "review") return `/creator/courses/${courseId}/review`;
  if (status === "published") return `/creator/courses/${courseId}/published`;
  if (status === "unpublished") return `/creator/courses/${courseId}/preview`;
  return `/creator/courses/${courseId}/sources`;
}

function courseActionLabel(status: CourseLifecycleStatus) {
  if (status === "review") return "Continue review";
  if (status === "published") return "View / Manage";
  if (status === "unpublished") return "Review / Publish again";
  return "Continue setup";
}

function requireApiToken() {
  const session = getAuthSession();
  if (!session || session.mode !== "api") throw new Error("Sign in with the backend before continuing.");
  return session.accessToken;
}

export async function createConfiguredCourse(input: CreateCourseInput) {
  if (shouldUseFrontendMocks) {
    await demoDelay(500);
    return { id: "digital-marketing-foundations" };
  }
  return createCourse(input, requireApiToken());
}

export async function loadCourseList(): Promise<CourseListItem[]> {
  if (shouldUseFrontendMocks) {
    await demoDelay(300);
    return mockCourses.map((course) => {
      const generated = readGeneratedCourseState(course.id);
      const status = generated?.lifecycle ?? course.lifecycle;
      return {
        id: course.id,
        title: generated?.course.title ?? course.name,
        status,
        destination: status === "draft" && !generated ? "/creator/courses/new/basics" : courseDestination(course.id, status),
        actionLabel: courseActionLabel(status),
        analyticsHref: status === "published" ? `/creator/analytics/${course.id}` : undefined,
      };
    });
  }

  const courses = await getCourses(requireApiToken());
  return courses.map((course) => {
    const status = apiLifecycleStatus(course.status);
    return {
      id: String(course.id),
      title: course.title,
      status,
      destination: `/creator/courses/${course.id}/sources`,
      actionLabel: "Manage sources",
    };
  });
}
