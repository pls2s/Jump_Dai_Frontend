import { ComponentPreview } from "./component-preview";
import { FormPreview } from "./form-preview";
import { FoundationPreview } from "./foundation-preview";

export function DesignSystemPreview() {
  return (
    <div className="grid gap-16 lg:gap-20">
      <FoundationPreview />
      <ComponentPreview />
      <FormPreview />
    </div>
  );
}
