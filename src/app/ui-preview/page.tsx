import type { Metadata } from "next";


import { AppShell, ContentContainer, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui";
import { navigationFor } from "@/data/navigation";
import { DesignSystemPreview } from "@/features/design-system/components/design-system-preview";

export const metadata: Metadata = {
  title: "UI Preview",
  description: "Internal reference for the SkillSync AI design foundation.",
};

export default function UiPreviewPage() {
  return (
    <AppShell
      navigation={navigationFor("/ui-preview")}
      brandHref="/ui-preview"
      pageContext="Internal UI reference"
      showCreatorProfile={false}
    >
      <ContentContainer>
        <PageHeader
          eyebrow="Internal reference"
          title="SkillSync UI preview"
          description="A living view of the tokens and primitives future MVP features should reuse."
          breadcrumb={[
            { label: "UI preview" },
          ]}
          actions={<Badge variant="info" dot>Version 0.1</Badge>}
        />

        <div className="mt-14 lg:mt-16">
          <DesignSystemPreview />
        </div>
      </ContentContainer>
    </AppShell>
  );
}
