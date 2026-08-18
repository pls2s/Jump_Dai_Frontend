"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock3, LogOut } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Badge, Button, Card } from "@/components/ui";
import { clearAuthSession, getAuthSession, routeForWorkspace } from "@/features/auth/lib/auth-session";

export function RolePlaceholder({
  role,
  title,
  description,
}: {
  role: "Learner" | "Organization";
  title: string;
  description: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    const expectedWorkspace = role.toLowerCase();
    if (session.mode !== "bypass" && session.user.workspaceType !== expectedWorkspace) {
      router.replace(session.user.workspaceType ? routeForWorkspace(session.user.workspaceType) : "/sign-in");
    }
  }, [role, router]);

  function signOut() {
    clearAuthSession();
    router.push("/sign-in?signedOut=1");
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background-page">
      <header className="border-b border-border-default bg-surface-default px-5 py-4 sm:px-8">
        <BrandMark />
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-12">
        <Card className="w-full p-6 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-yellow-100 text-neutral-800">
            <Clock3 className="size-6" aria-hidden="true" />
          </span>
          <Badge variant="accent" className="mt-5">{role} experience · Future</Badge>
          <h1 className="type-h1 mt-4">{title}</h1>
          <p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">{description}</p>
          <p className="type-body-small mx-auto mt-5 max-w-xl rounded-md bg-blue-50 p-4 text-blue-800">
            This workspace is an intentional frontend placeholder. Your current session remains active, and no Creator or Admin permission is granted here.
          </p>
          <Button className="mt-8" variant="secondary" onClick={signOut}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>
        </Card>
      </div>
    </main>
  );
}
