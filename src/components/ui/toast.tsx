"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "./button";

export type ToastTone = "success" | "error" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

interface ToastMessage extends ToastInput {
  id: number;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success: "border-green-200 bg-status-success-subtle text-status-success",
  error: "border-red-100 bg-status-error-subtle text-status-error",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const toneIcons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} satisfies Record<ToastTone, typeof CheckCircle2>;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = ++nextId.current;
    const toast: ToastMessage = { ...input, id, tone: input.tone ?? "info" };
    setToasts((current) => [...current.slice(-2), toast]);
    if (input.duration !== 0) {
      const timer = window.setTimeout(() => dismissToast(id), input.duration ?? 4500);
      timers.current.set(id, timer);
    }
    return id;
  }, [dismissToast]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-3 sm:left-auto sm:w-full sm:max-w-sm" aria-label="Notifications">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const Icon = toneIcons[toast.tone];
  return (
    <div
      className={cn("pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg", toneStyles[toast.tone])}
      role={toast.tone === "error" ? "alert" : "status"}
      aria-live={toast.tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="type-caption mt-1 text-text-secondary">{toast.description}</p>}
      </div>
      <Button variant="ghost" size="icon" className="-m-2 shrink-0" onClick={onDismiss} aria-label={`Dismiss ${toast.title} notification`}>
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}
