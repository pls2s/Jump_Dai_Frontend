"use client";

import { useEffect, useRef } from "react";
import { FileCheck2, X } from "lucide-react";

import { Badge, Button, Card } from "@/components/ui";
import type { SourceReference } from "@/types/product";

export function SourceReferencesDrawer({
  references,
  onClose,
  description = "Prototype references show how generated content traces back to trusted knowledge sources.",
}: {
  references: SourceReference[];
  onClose: () => void;
  description?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-[1px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="sources-drawer-title" aria-describedby="sources-drawer-description" className="ml-auto flex h-dvh w-full max-w-lg flex-col bg-surface-default shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border-default p-5 sm:p-6">
          <div><Badge variant="success"><FileCheck2 className="size-3.5" aria-hidden="true" />Source grounded</Badge><h2 id="sources-drawer-title" className="type-title-large mt-3">Source references</h2><p id="sources-drawer-description" className="type-body-small mt-1 text-text-secondary">{description}</p></div>
          <Button ref={closeRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close source references"><X className="size-5" aria-hidden="true" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4">
            {references.map((reference) => (
              <Card key={reference.id} className="p-5">
                <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700"><FileCheck2 className="size-4" aria-hidden="true" /></span><div><h3 className="font-semibold">{reference.sourceName}</h3><p className="type-caption mt-0.5 text-text-tertiary">{reference.location}</p></div></div>
                <blockquote className="type-body-small mt-4 border-l-2 border-yellow-400 pl-4 leading-6 text-text-secondary">“{reference.excerpt}”</blockquote>
              </Card>
            ))}
          </div>
        </div>
        <div className="border-t border-border-default p-5"><Button variant="secondary" className="w-full" onClick={onClose}>Done reviewing</Button></div>
      </aside>
    </div>
  );
}
