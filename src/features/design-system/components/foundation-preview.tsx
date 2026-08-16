import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  colorGroups,
  radiusScale,
  semanticColors,
  spacingScale,
  typographySamples,
} from "@/data/design-system";
import { cn } from "@/lib/cn";
import { PreviewSection } from "./preview-section";

export function FoundationPreview() {
  return (
    <div className="grid gap-16">
      <PreviewSection
        id="color"
        title="Color"
        description="Raw palette values are defined once and mapped to semantic tokens used by components."
      >
        <div className="grid gap-8">
          {colorGroups.map((group) => (
            <div key={group.name}>
              <h3 className="type-label mb-3 text-text-primary">{group.name}</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                {group.colors.map((color) => (
                  <div
                    key={`${group.name}-${color.name}`}
                    className="overflow-hidden rounded-md border border-border-default bg-surface-default"
                  >
                    <div
                      className="h-16"
                      style={{ backgroundColor: `var(${color.cssVariable})` }}
                    />
                    <div className="p-2.5">
                      <p className="type-caption font-semibold text-text-primary">
                        {color.name}
                      </p>
                      <p className="type-caption text-text-tertiary">{color.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="type-label mb-3 text-text-primary">Semantic tokens</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {semanticColors.map((color) => (
                <div
                  key={color.name}
                  className="flex items-center gap-3 rounded-md border border-border-default bg-surface-default p-3"
                >
                  <span
                    className="size-8 shrink-0 rounded-sm border border-neutral-950/10"
                    style={{ backgroundColor: `var(${color.cssVariable})` }}
                  />
                  <span className="type-body-small font-medium text-text-primary">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection
        id="typography"
        title="Typography"
        description="Anuphan supports the English-first interface and future Thai localization in one coherent family."
      >
        <Card>
          <CardContent className="divide-y divide-border-default p-0 sm:p-0">
            {typographySamples.map((sample) => (
              <div
                key={sample.label}
                className="grid gap-2 px-5 py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:px-6"
              >
                <p className="type-caption text-text-tertiary">{sample.label}</p>
                <p className={cn(sample.className, "text-text-primary")}>Learn with clarity.</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </PreviewSection>

      <PreviewSection
        id="spacing"
        title="Spacing and radius"
        description="The spacing scale follows a 4px base with an 8px rhythm for most layout decisions."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Spacing scale</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {spacingScale.map((space) => (
                <div
                  key={space}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3"
                >
                  <span className="type-caption text-text-secondary">{space}</span>
                  <span
                    className="block h-2 rounded-full bg-blue-300"
                    style={{ width: `${space}px` }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radius scale</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {radiusScale.map((radius) => (
                <div key={radius.name}>
                  <div
                    className={cn(
                      "mb-2 aspect-square max-w-24 border border-blue-200 bg-blue-50",
                      radius.className,
                    )}
                  />
                  <p className="type-body-small font-medium text-text-primary">
                    {radius.name}
                  </p>
                  <p className="type-caption text-text-tertiary">{radius.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PreviewSection>
    </div>
  );
}
