import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui";

import "./globals.css";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillSync AI",
    template: "%s | SkillSync AI",
  },
  description:
    "An AI-powered learning platform for building verified, job-relevant skills.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anuphan.variable} antialiased`}>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
