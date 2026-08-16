import { notFound } from "next/navigation";
import { CourseWizard, type WizardStep } from "@/features/course-setup/components/course-wizard";

const validSteps: WizardStep[] = ["basics", "audience", "objectives", "certificate", "review"];

export default async function CourseSetupPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!validSteps.includes(step as WizardStep)) notFound();
  return <CourseWizard step={step as WizardStep} />;
}
