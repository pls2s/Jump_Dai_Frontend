import type { Metadata } from "next";
import { Anuphan } from "next/font/google";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anuphan.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
