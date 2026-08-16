import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Verify email" };
export default function VerifyOtpPage() { return <AuthShell><OtpForm /></AuthShell>; }
