"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { defaultCourseSetup } from "@/data/mock/product";
import { readCourseSetup, writeCourseSetup } from "@/lib/mock/course-setup-store";
import type { CourseSetup } from "@/types/product";

interface CourseSetupContextValue {
  course: CourseSetup;
  updateCourse: (updates: Partial<CourseSetup>) => void;
}

const CourseSetupContext = createContext<CourseSetupContextValue | null>(null);
export function CourseSetupProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<CourseSetup>(defaultCourseSetup);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) {
      writeCourseSetup(course);
      return;
    }
    hydratedRef.current = true;
    const storedCourse = readCourseSetup();
    if (JSON.stringify(storedCourse) !== JSON.stringify(defaultCourseSetup)) {
      window.setTimeout(() => setCourse(storedCourse), 0);
    }
  }, [course]);

  const value = useMemo(
    () => ({
      course,
      updateCourse: (updates: Partial<CourseSetup>) => setCourse((current) => ({ ...current, ...updates })),
    }),
    [course],
  );

  return <CourseSetupContext.Provider value={value}>{children}</CourseSetupContext.Provider>;
}

export function useCourseSetup() {
  const context = useContext(CourseSetupContext);
  if (!context) throw new Error("useCourseSetup must be used within CourseSetupProvider");
  return context;
}
