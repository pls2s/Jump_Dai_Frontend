import { demoDelay } from "@/lib/mock/demo-services";
import { getMockCourse } from "@/data/mock/product";
import { isFrontendBypassEnabled } from "@/lib/config";
import type { GeneratedCourseState } from "@/types/product";
import {
  createGeneratedCourseState,
  readGeneratedCourseState,
  writeGeneratedCourseState,
} from "../lib/generated-course-store";

export async function completeMockGeneration(courseId: string) {
  await demoDelay(350);
  const state = createGeneratedCourseState(courseId);
  return writeGeneratedCourseState(state);
}

export async function saveGeneratedCourseState(state: GeneratedCourseState) {
  await demoDelay(260);
  return writeGeneratedCourseState(state);
}

export async function publishGeneratedCourse(state: GeneratedCourseState) {
  await demoDelay(700);
  return writeGeneratedCourseState({
    ...state,
    lifecycle: "published",
    publishedAt: new Date().toISOString(),
  });
}

export async function unpublishGeneratedCourse(state: GeneratedCourseState) {
  await demoDelay(600);
  return writeGeneratedCourseState({ ...state, lifecycle: "unpublished" });
}

export function loadGeneratedCourse(courseId: string) {
  const stored = readGeneratedCourseState(courseId);
  if (stored || !isFrontendBypassEnabled) return stored;
  const mockCourse = getMockCourse(courseId);
  if (!mockCourse) return null;
  const created = createGeneratedCourseState(courseId);
  const lifecycle = "lifecycle" in mockCourse ? mockCourse.lifecycle : created.lifecycle;
  return writeGeneratedCourseState({
    ...created,
    lifecycle,
    course: { ...created.course, title: mockCourse.name },
    publishedAt: lifecycle === "published" ? new Date().toISOString() : undefined,
  });
}
