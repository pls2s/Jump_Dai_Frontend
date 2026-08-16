import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { CreateAccountForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Create account" };
export default function CreateAccountPage() { return <AuthShell><CreateAccountForm /></AuthShell>; }
