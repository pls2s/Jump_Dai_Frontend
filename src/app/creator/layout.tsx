import type { ReactNode } from "react";
import { CreatorShell } from "@/features/creator/components/creator-shell";

export default function CreatorLayout({ children }: { children: ReactNode }) { return <CreatorShell>{children}</CreatorShell>; }
