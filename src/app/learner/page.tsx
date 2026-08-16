import type { Metadata } from "next";
import { LearnerHome } from "@/features/learner/components/learner-home";

export const metadata: Metadata = { title: "Learner workspace" };

export default function LearnerPage() {
  return <LearnerHome />;
}
