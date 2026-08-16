import { demoDelay } from "@/lib/mock/demo-services";
import { FRONTEND_PREVIEW_COURSE_ID } from "@/data/mock/product";
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
  if (stored || !isFrontendBypassEnabled || courseId !== FRONTEND_PREVIEW_COURSE_ID) return stored;
  return writeGeneratedCourseState(createGeneratedCourseState(courseId));
}
