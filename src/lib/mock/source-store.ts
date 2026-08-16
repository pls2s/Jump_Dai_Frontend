import { initialKnowledgeSources } from "@/data/mock/product";
import type { KnowledgeSource } from "@/types/product";

export function sourceStorageKey(courseId: string) {
  return `skillsync-sources:${courseId}`;
}

export function readMockSources(courseId: string): KnowledgeSource[] {
  if (typeof window === "undefined") return initialKnowledgeSources;
  const stored = localStorage.getItem(sourceStorageKey(courseId));
  if (!stored) return initialKnowledgeSources;
  try {
    return JSON.parse(stored) as KnowledgeSource[];
  } catch {
    localStorage.removeItem(sourceStorageKey(courseId));
    return initialKnowledgeSources;
  }
}

export function writeMockSources(courseId: string, sources: KnowledgeSource[]) {
  localStorage.setItem(sourceStorageKey(courseId), JSON.stringify(sources));
}
