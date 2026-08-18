import { ArrowRight, Eye, LayoutGrid } from "lucide-react";
import { notFound } from "next/navigation";

import { BrandMark } from "@/components/shared/brand-mark";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { frontendPreviewCourseId, frontendPreviewGroups } from "@/data/frontend-preview";
import { isFrontendBypassEnabled } from "@/lib/config";

export default function FrontendPreviewIndexPage() {
  if (!isFrontendBypassEnabled) notFound();

  return (
    <main className="min-h-dvh bg-background-page">
      <header className="border-b border-border-default bg-surface-default">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <BrandMark />
          <Badge variant="accent"><Eye className="size-3.5" aria-hidden="true" />Frontend preview</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl">
          <p className="type-label text-action-primary">Development route index</p>
          <h1 className="type-h1 mt-2">Review the implemented SkillSync frontend</h1>
          <p className="type-body-large mt-4 text-text-secondary">
            Open any current product screen from Functions 01–20 without backend authentication or prerequisite setup. Product rules remain enforced when bypass mode is off.
          </p>
          <div className="type-body-small mt-5 flex flex-wrap gap-x-5 gap-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <span><strong>Preview identity:</strong> Frontend Preview</span>
            <span><strong>Course fixture:</strong> {frontendPreviewCourseId}</span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {frontendPreviewGroups.map((group) => (
            <Card key={group.functionId} className="overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default bg-neutral-25 px-5 py-4">
                <span className="flex size-9 items-center justify-center rounded-md bg-blue-800 text-sm font-semibold text-white">{group.functionId}</span>
                <div>
                  <p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">Function {group.functionId}</p>
                  <h2 className="font-semibold text-text-primary">{group.title}</h2>
                </div>
              </div>
              <div className="divide-y divide-border-default">
                {group.routes.map((route) => (
                  <a key={route.href} href={route.href} className="group flex min-h-16 items-center gap-4 px-5 py-3 transition hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-500">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-action-primary group-hover:bg-surface-default"><LayoutGrid className="size-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-text-primary">{route.label}</span><span className="type-caption mt-0.5 block text-text-tertiary">{route.description}</span></span>
                    <ArrowRight className="size-4 shrink-0 text-text-tertiary group-hover:text-action-primary" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 flex flex-col items-start justify-between gap-4 border-blue-200 p-5 sm:flex-row sm:items-center">
          <div><h2 className="font-semibold">Start from the Creator workspace</h2><p className="type-body-small mt-1 text-text-secondary">Use the normal product navigation with the synthesized preview session.</p></div>
          <ButtonLink href="/creator">Open Creator workspace<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
        </Card>
      </div>
    </main>
  );
}
