"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  Progress,
  Spinner,
  Stepper,
  useToast,
} from "@/components/ui";
import { PreviewSection } from "./preview-section";

export function ComponentPreview() {
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="grid gap-16">
      <PreviewSection
        id="buttons"
        title="Buttons"
        description="A small variant set covers product hierarchy without introducing one-off button styles."
      >
        <Card>
          <CardContent className="grid gap-8 pt-5 sm:pt-6">
            <div>
              <p className="type-label mb-3 text-text-primary">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary action</Button>
                <Button variant="accent">
                  <Sparkles className="size-4" aria-hidden="true" />
                  AI action
                </Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Delete</Button>
              </div>
            </div>
            <div>
              <p className="type-label mb-3 text-text-primary">Sizes and states</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large action</Button>
                <Button disabled>Disabled</Button>
                <Button isLoading loadingLabel="Generating" />
              </div>
            </div>
          </CardContent>
        </Card>
      </PreviewSection>

      <PreviewSection
        id="feedback"
        title="Feedback and confirmation"
        description="Temporary global feedback uses accessible toasts; consequential actions use one focus-managed confirmation pattern."
      >
        <Card>
          <CardContent className="flex flex-wrap gap-3 pt-5 sm:pt-6">
            <Button variant="secondary" onClick={() => showToast({ tone: "success", title: "Changes saved" })}>Show success</Button>
            <Button variant="secondary" onClick={() => showToast({ tone: "info", title: "Processing continues", description: "You can safely keep working." })}>Show information</Button>
            <Button variant="secondary" onClick={() => showToast({ tone: "error", title: "Something went wrong", description: "Try the action again." })}>Show error</Button>
            <Button variant="danger" onClick={() => setConfirming(true)}>Open confirmation</Button>
          </CardContent>
        </Card>
        <ConfirmationDialog open={confirming} title="Confirm this action?" description="This internal preview demonstrates focus, Escape, Cancel, and destructive intent." confirmLabel="Confirm action" confirmVariant="danger" onConfirm={() => { setConfirming(false); showToast({ tone: "success", title: "Action confirmed" }); }} onCancel={() => setConfirming(false)} />
      </PreviewSection>

      <PreviewSection
        id="status"
        title="Status and progress"
        description="Status is always paired with readable text and never communicated by color alone."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Compact labels for metadata and state.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge dot>Draft</Badge>
              <Badge variant="info" dot>Analyzing</Badge>
              <Badge variant="accent" dot>AI generated</Badge>
              <Badge variant="success" dot>Verified</Badge>
              <Badge variant="warning" dot>Needs review</Badge>
              <Badge variant="error" dot>Action required</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Warm yellow highlights learning momentum.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Progress value={68} label="Course setup" showValue />
              <Progress value={35} label="Knowledge processing" showValue size="sm" />
              <Spinner label="Analyzing knowledge sources…" />
            </CardContent>
          </Card>
        </div>
      </PreviewSection>

      <PreviewSection
        id="cards"
        title="Cards"
        description="Cards rely on clear grouping, spacing, and a subtle border before elevation."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Default surface</CardTitle>
              <CardDescription>
                The standard container for related content and actions.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="-ml-3">
                View example
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-background-subtle">
            <CardHeader>
              <Badge variant="accent" className="mb-2 w-fit">Learning highlight</Badge>
              <CardTitle>Emphasized surface</CardTitle>
              <CardDescription>
                A gentle brand tint can call out an important learning moment.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Elevated surface</CardTitle>
              <CardDescription>
                Elevation is reserved for floating or especially prominent content.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PreviewSection>

      <PreviewSection
        id="stepper"
        title="Progress steps"
        description="The stepper gives long creator and learner flows a clear sense of place."
      >
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <Stepper
              steps={[
                { label: "Configure", description: "Course basics", status: "complete" },
                { label: "Add knowledge", description: "Upload sources", status: "current" },
                { label: "Generate", description: "Create structure", status: "upcoming" },
                { label: "Review", description: "Verify content", status: "upcoming" },
              ]}
            />
          </CardContent>
        </Card>
      </PreviewSection>
    </div>
  );
}
