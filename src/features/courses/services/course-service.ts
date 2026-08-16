import { mockCourses } from "@/data/mock/product";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { isFrontendDemoMode } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";
import { createCourse, getCourses, type ApiCourseStatus, type CreateCourseInput } from "../api/course-api";

export interface CourseListItem {
  id: string;
  title: string;
  status: ApiCourseStatus;
  destination: string;
}

function requireApiToken() {
  const session = getAuthSession();
  if (!session || session.mode !== "api") throw new Error("Sign in with the backend before continuing.");
  return session.accessToken;
}

export async function createConfiguredCourse(input: CreateCourseInput) {
  if (isFrontendDemoMode) {
    await demoDelay(500);
    return { id: "digital-marketing-foundations" };
  }
  return createCourse(input, requireApiToken());
}

export async function loadCourseList(): Promise<CourseListItem[]> {
  if (isFrontendDemoMode) {
    await demoDelay(300);
    return mockCourses.map((course) => ({
      id: course.id,
      title: course.name,
      status: "DRAFT",
      destination: course.currentStep === "Knowledge Sources"
        ? `/creator/courses/${course.id}/sources`
        : "/creator/courses/new/basics",
    }));
  }

  const courses = await getCourses(requireApiToken());
  return courses.map((course) => ({
    id: String(course.id),
    title: course.title,
    status: course.status,
    destination: `/creator/courses/${course.id}/sources`,
  }));
}
