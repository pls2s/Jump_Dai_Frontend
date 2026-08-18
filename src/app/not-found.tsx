import { FileQuestion } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { ButtonLink, Card } from "@/components/ui";
import { isFrontendBypassEnabled } from "@/lib/config";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-page p-5 sm:p-8">
      <Card className="w-full max-w-xl p-7 text-center sm:p-10">
        <div className="flex justify-center"><BrandMark /></div>
        <span className="mx-auto mt-8 flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><FileQuestion className="size-6" aria-hidden="true" /></span>
        <p className="type-label mt-5 text-action-primary">404</p>
        <h1 className="type-h1 mt-2">Page not found</h1>
        <p className="type-body-small mx-auto mt-3 max-w-md text-text-secondary">The page may have moved, the item may no longer exist, or the link is invalid.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href="/sign-in">Go to Sign In</ButtonLink>{isFrontendBypassEnabled && <ButtonLink href="/dev/frontend-preview" variant="secondary">Frontend preview</ButtonLink>}</div>
      </Card>
    </main>
  );
}
