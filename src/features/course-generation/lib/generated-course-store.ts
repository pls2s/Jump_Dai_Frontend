import { generatedCourseTemplate } from "@/data/mock/generated-course";
import { readCourseSetup } from "@/lib/mock/course-setup-store";
import type {
  GeneratedCourse,
  GeneratedCourseState,
  PublishReadinessCheck,
  ReviewableItem,
  ReviewStatus,
} from "@/types/product";

const storagePrefix = "skillsync-generated-course:";

export function generatedCourseStorageKey(courseId: string) {
  return `${storagePrefix}${courseId}`;
}

function cloneTemplate(): GeneratedCourse {
  return structuredClone(generatedCourseTemplate);
}

export function createGeneratedCourseState(courseId: string): GeneratedCourseState {
  const setup = readCourseSetup();
  const template = cloneTemplate();
  const course: GeneratedCourse = {
    ...template,
    id: courseId,
    title: setup.name,
    description: setup.description,
    targetLearner: setup.targetLearner,
    level: setup.level,
    learningObjectives: setup.objectives.filter((objective) => objective.trim().length > 0),
    certificateEnabled: setup.certificateEnabled,
    completionCriteria: setup.completionCriteria,
  };
  const timestamp = new Date().toISOString();
  const reviews = Object.fromEntries(
    getReviewableItems(course).map((item) => [item.id, "not-reviewed" as ReviewStatus]),
  );
  return { version: 1, course, lifecycle: "review", reviews, generatedAt: timestamp, updatedAt: timestamp };
}

export function readGeneratedCourseState(courseId: string): GeneratedCourseState | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(generatedCourseStorageKey(courseId));
  if (!saved) return null;
  try {
    return JSON.parse(saved) as GeneratedCourseState;
  } catch {
    localStorage.removeItem(generatedCourseStorageKey(courseId));
    return null;
  }
}

export function writeGeneratedCourseState(state: GeneratedCourseState) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(generatedCourseStorageKey(state.course.id), JSON.stringify(next));
  return next;
}

export function getReviewableItems(course: GeneratedCourse): ReviewableItem[] {
  return [
    { kind: "course", id: "course-overview", label: "Course overview", value: course },
    ...course.modules.flatMap<ReviewableItem>((module) => [
      { kind: "module", id: module.id, label: module.title, value: module },
      ...module.lessons.map<ReviewableItem>((lesson) => ({ kind: "lesson", id: lesson.id, label: lesson.title, value: lesson })),
    ]),
    { kind: "practical-task", id: course.practicalTask.id, label: course.practicalTask.title, value: course.practicalTask },
    { kind: "final-assessment", id: course.finalAssessment.id, label: course.finalAssessment.title, value: course.finalAssessment },
  ];
}

export function findReviewableItem(course: GeneratedCourse, itemId: string) {
  return getReviewableItems(course).find((item) => item.id === itemId) ?? getReviewableItems(course)[0];
}

export function getReviewProgress(state: GeneratedCourseState) {
  const requiredIds = getReviewableItems(state.course).map((item) => item.id);
  const verified = requiredIds.filter((id) => state.reviews[id] === "verified").length;
  return { verified, total: requiredIds.length, percentage: Math.round((verified / Math.max(requiredIds.length, 1)) * 100) };
}

export function getPublishReadiness(state: GeneratedCourseState, hasReadySources: boolean): PublishReadinessCheck[] {
  const { course } = state;
  const reviewProgress = getReviewProgress(state);
  const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0);
  const generatedContentComplete = lessonCount > 0 && Boolean(course.practicalTask.instructions.trim()) && Boolean(course.finalAssessment.instructions.trim());
  const lessonAssessmentsCovered = course.modules.every((module) => module.lessons.every((lesson) => Boolean(lesson.exercise || lesson.quiz)));
  return [
    { id: "course-info", label: "Course information complete", passed: course.title.trim().length >= 3 && course.description.trim().length >= 20 },
    { id: "objectives", label: "Learning objectives defined", passed: course.learningObjectives.length > 0 && course.learningObjectives.every((objective) => objective.trim().length >= 8) },
    { id: "sources", label: "Knowledge sources available", passed: hasReadySources, detail: hasReadySources ? undefined : "At least one Ready source is required." },
    { id: "generated", label: "Required AI content generated", passed: course.modules.length > 0 && generatedContentComplete, detail: generatedContentComplete ? undefined : "Modules, lessons, practical task, and final assessment are required." },
    { id: "review", label: "Creator review complete", passed: reviewProgress.verified === reviewProgress.total, detail: reviewProgress.verified === reviewProgress.total ? undefined : `${reviewProgress.total - reviewProgress.verified} review items remain.` },
    { id: "verified", label: "Lesson activities and required items verified", passed: reviewProgress.verified === reviewProgress.total && lessonAssessmentsCovered, detail: lessonAssessmentsCovered ? undefined : "Every lesson needs an exercise or quiz." },
    { id: "certificate", label: "Certificate criteria defined", passed: !course.certificateEnabled || Boolean(course.completionCriteria), detail: course.certificateEnabled && !course.completionCriteria ? "Choose certificate completion criteria." : undefined },
  ];
}
