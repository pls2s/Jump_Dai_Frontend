"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button, type ButtonVariant } from "./button";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  pending = false,
  pendingLabel = "Working…",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  pending?: boolean;
  pendingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel, open, pending]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onCancel(); }}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="w-full max-w-md rounded-xl border border-border-default bg-surface-default p-5 shadow-lg sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><AlertTriangle className="size-5" aria-hidden="true" /></span>
          <Button variant="ghost" size="icon" onClick={onCancel} disabled={pending} aria-label="Close dialog"><X className="size-5" aria-hidden="true" /></Button>
        </div>
        <h2 id={titleId} className="type-title-large mt-5">{title}</h2>
        <p id={descriptionId} className="mt-2 text-text-secondary">{description}</p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={pending}>{cancelLabel}</Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={pending} loadingLabel={pendingLabel}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
