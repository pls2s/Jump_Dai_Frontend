import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AccountTypeForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Choose account type" };
export default function AccountTypePage() { return <AuthShell><AccountTypeForm /></AuthShell>; }
