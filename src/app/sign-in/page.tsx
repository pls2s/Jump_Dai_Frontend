import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignInForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return <AuthShell><Suspense fallback={<div className="h-96" />}><SignInForm /></Suspense></AuthShell>;
}
