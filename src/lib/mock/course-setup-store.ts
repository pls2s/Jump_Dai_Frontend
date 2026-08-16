import { defaultCourseSetup } from "@/data/mock/product";
import type { CourseSetup } from "@/types/product";

export const courseSetupStorageKey = "skillsync-course-setup";

export function readCourseSetup(): CourseSetup {
  if (typeof window === "undefined") return defaultCourseSetup;
  const saved = localStorage.getItem(courseSetupStorageKey);
  if (!saved) return defaultCourseSetup;
  try {
    return { ...defaultCourseSetup, ...JSON.parse(saved) } as CourseSetup;
  } catch {
    localStorage.removeItem(courseSetupStorageKey);
    return defaultCourseSetup;
  }
}

export function writeCourseSetup(course: CourseSetup) {
  localStorage.setItem(courseSetupStorageKey, JSON.stringify(course));
}
