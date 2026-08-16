import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Layers3, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/shared/brand-mark";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-surface-default lg:grid lg:grid-cols-[minmax(32rem,1.08fr)_minmax(28rem,0.92fr)]">
      <aside className="relative overflow-hidden bg-blue-800 px-5 py-7 text-white sm:px-10 sm:py-9 lg:flex lg:min-h-dvh lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute -top-24 -left-24 size-72 rounded-full border border-white/10" />
        <div className="absolute top-10 left-10 size-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative lg:pt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium">
            <Sparkles className="size-4 text-yellow-300" aria-hidden="true" />
            Source-grounded course creation
          </span>
          <h2 className="mt-5 max-w-2xl text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-3xl lg:mt-10 lg:text-[clamp(2.75rem,4vw,4.75rem)] lg:leading-[1.06] lg:tracking-[-0.045em]">
            Turn trusted knowledge into learning that works.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base lg:mt-7 lg:text-lg lg:leading-8">
            SkillSync helps creators structure expertise, uncover learning relationships, and build courses with clear source grounding.
          </p>
        </div>
        <div className="relative mt-10 hidden gap-3 sm:grid sm:grid-cols-2 lg:mt-16">
          <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <BookOpenCheck className="size-5 text-yellow-300" aria-hidden="true" />
            <p className="mt-3 font-semibold">Your sources stay visible</p>
            <p className="mt-1 text-sm text-blue-100">Review exactly what informs each concept.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <Layers3 className="size-5 text-yellow-300" aria-hidden="true" />
            <p className="mt-3 font-semibold">From material to structure</p>
            <p className="mt-1 text-sm text-blue-100">See topics and sequencing emerge clearly.</p>
          </div>
        </div>
      </aside>

      <section className="flex min-h-[calc(100dvh-13rem)] flex-col px-5 py-6 sm:min-h-0 sm:px-10 lg:min-h-dvh lg:px-12 lg:py-10 xl:px-16">
        <div>
          <Link href="/sign-in" aria-label="SkillSync AI sign in" className="rounded-md">
            <BrandMark />
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[29rem] flex-1 items-center py-10 sm:py-14 lg:py-12">
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="type-body-small mb-7 inline-flex items-center gap-2 rounded-sm font-medium text-text-secondary hover:text-text-primary">
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
