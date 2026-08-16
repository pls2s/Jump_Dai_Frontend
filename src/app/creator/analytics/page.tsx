import { BarChart3 } from "lucide-react";
import { ContentContainer, PageHeader } from "@/components/layout";
import { ButtonLink, Card } from "@/components/ui";

export default function AnalyticsPage() { return <ContentContainer><PageHeader title="Analytics" description="Course and learner insights will appear once your first course is published." /><Card className="mt-8 flex flex-col items-center px-5 py-14 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><BarChart3 className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-4">No analytics yet</h2><p className="type-body-small mt-2 max-w-md text-text-secondary">Finish setting up your first course to begin collecting useful learning signals.</p><ButtonLink href="/creator/courses/digital-marketing-foundations/sources" className="mt-5">Continue your course</ButtonLink></Card></ContentContainer>; }
