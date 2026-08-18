"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Button, ButtonLink, Card, ConfirmationDialog, EmptyState, ErrorState, InvalidEntityState, LoadingState, useToast } from "@/components/ui";

type PreviewView = "index" | "loading" | "empty" | "error" | "confirmation" | "disabled" | "feedback" | "invalid";
const validViews: PreviewView[] = ["index", "loading", "empty", "error", "confirmation", "disabled", "feedback", "invalid"];

function previewView(value: string | null): PreviewView {
  return validViews.includes(value as PreviewView) ? value as PreviewView : "index";
}

export function SupportingStatesPreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const view = previewView(searchParams.get("view"));
  const [dialogOpen, setDialogOpen] = useState(view === "confirmation");

  if (view === "loading") return <PreviewFrame><LoadingState title="Loading course data" description="Preparing the latest course and learner information…" /></PreviewFrame>;
  if (view === "empty") return <PreviewFrame><EmptyState title="No courses yet" description="Create a course to begin adding knowledge sources and learning content." action={{ href: "/creator/courses/new/basics", label: "Create course" }} /></PreviewFrame>;
  if (view === "error") return <PreviewFrame><ErrorState title="Course data unavailable" description="We couldn’t load this view. Your saved frontend data is safe." onRetry={() => router.replace("/dev/frontend-preview/supporting-states")} /></PreviewFrame>;
  if (view === "invalid") return <PreviewFrame><InvalidEntityState entityName="Course" backHref="/creator/courses" backLabel="Back to My Courses" /></PreviewFrame>;
  if (view === "disabled") return <PreviewFrame><Card className="mt-8 p-6 sm:p-8"><h2 className="type-title-large">Publish readiness</h2><p className="type-body-small mt-2 text-text-secondary">Important disabled actions include an associated explanation.</p><Button className="mt-6" disabled aria-describedby="preview-disabled-reason">Publish course</Button><p id="preview-disabled-reason" className="type-body-small mt-3 text-status-warning">Publish is unavailable because 2 lessons still need Creator verification.</p></Card></PreviewFrame>;
  if (view === "feedback") return <PreviewFrame><Card className="mt-8 p-6 sm:p-8"><h2 className="type-title-large">Application feedback</h2><p className="type-body-small mt-2 text-text-secondary">Shared success, information, and error messages use the same accessible toast provider.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => showToast({ tone: "success", title: "Changes saved", description: "Your frontend changes are stored in this browser." })}><CheckCircle2 className="size-4" aria-hidden="true" />Success</Button><Button variant="secondary" onClick={() => showToast({ tone: "info", title: "Report preparation started" })}><Info className="size-4" aria-hidden="true" />Information</Button><Button variant="danger" onClick={() => showToast({ tone: "error", title: "Something went wrong", description: "Try the action again without losing your saved data." })}><AlertTriangle className="size-4" aria-hidden="true" />Error</Button></div></Card></PreviewFrame>;
  if (view === "confirmation") return <PreviewFrame><Card className="mt-8 p-6 sm:p-8"><h2 className="type-title-large">Confirmation dialog</h2><p className="type-body-small mt-2 text-text-secondary">Destructive or irreversible actions use one focus-managed dialog.</p><Button variant="danger" className="mt-6" onClick={() => setDialogOpen(true)}>Open confirmation</Button></Card><ConfirmationDialog open={dialogOpen} title="Remove this source?" description="The source will be removed from this frontend preview. Existing generated course content remains unchanged." confirmLabel="Remove source" confirmVariant="danger" onConfirm={() => { setDialogOpen(false); showToast({ tone: "success", title: "Source removed" }); }} onCancel={() => setDialogOpen(false)} /></PreviewFrame>;

  const previews = [
    ["loading", "Loading", "Polite progress announcement"],
    ["empty", "Empty state", "Explanation and valid next action"],
    ["error", "Error / Retry", "Safe recovery without lost data"],
    ["feedback", "Toast feedback", "Success, information, and error tones"],
    ["confirmation", "Confirmation", "Focus-managed destructive action"],
    ["disabled", "Disabled CTA", "Associated reason for unavailable action"],
    ["invalid", "Invalid entity", "Clear recovery from an invalid link"],
  ] as const;
  return <PreviewFrame><div className="mt-8 grid gap-4 md:grid-cols-2">{previews.map(([key, title, description]) => <Card key={key} className="p-5"><h2 className="font-semibold">{title}</h2><p className="type-body-small mt-2 text-text-secondary">{description}</p><ButtonLink href={`/dev/frontend-preview/supporting-states?view=${key}`} variant="secondary" size="sm" className="mt-5">Open preview<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>)}</div></PreviewFrame>;
}

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return <ContentContainer className="max-w-[88rem]"><PageHeader eyebrow="Function 20 preview" title="Supporting states" description="Development-only examples using the same shared primitives as the product flows." breadcrumb={[{ label: "Frontend preview", href: "/dev/frontend-preview" }, { label: "Supporting states" }]} />{children}</ContentContainer>;
}
