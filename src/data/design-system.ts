export interface ColorToken {
  name: string;
  value: string;
  cssVariable: string;
}

export interface ColorGroup {
  name: string;
  colors: readonly ColorToken[];
}

export const colorGroups: readonly ColorGroup[] = [
  {
    name: "Blue",
    colors: [
      { name: "50", value: "#F3F6FF", cssVariable: "--blue-50" },
      { name: "100", value: "#E7EDFF", cssVariable: "--blue-100" },
      { name: "200", value: "#CFDAFF", cssVariable: "--blue-200" },
      { name: "300", value: "#AFC0FA", cssVariable: "--blue-300" },
      { name: "400", value: "#829BE9", cssVariable: "--blue-400" },
      { name: "500", value: "#5F7DD8", cssVariable: "--blue-500" },
      { name: "600", value: "#4866C4", cssVariable: "--blue-600" },
      { name: "700", value: "#3952A3", cssVariable: "--blue-700" },
      { name: "800", value: "#304583", cssVariable: "--blue-800" },
      { name: "900", value: "#293B6D", cssVariable: "--blue-900" },
    ],
  },
  {
    name: "Yellow",
    colors: [
      { name: "50", value: "#FFFBEA", cssVariable: "--yellow-50" },
      { name: "100", value: "#FFF3BF", cssVariable: "--yellow-100" },
      { name: "200", value: "#FFE889", cssVariable: "--yellow-200" },
      { name: "300", value: "#FFDC5B", cssVariable: "--yellow-300" },
      { name: "400", value: "#F6CA3D", cssVariable: "--yellow-400" },
      { name: "500", value: "#E6B62D", cssVariable: "--yellow-500" },
      { name: "600", value: "#BC8C1E", cssVariable: "--yellow-600" },
    ],
  },
  {
    name: "Neutral",
    colors: [
      { name: "0", value: "#FFFFFF", cssVariable: "--neutral-0" },
      { name: "25", value: "#FCFCFD", cssVariable: "--neutral-25" },
      { name: "50", value: "#F7F8FA", cssVariable: "--neutral-50" },
      { name: "100", value: "#EEF0F4", cssVariable: "--neutral-100" },
      { name: "200", value: "#DEE2E8", cssVariable: "--neutral-200" },
      { name: "300", value: "#C7CDD6", cssVariable: "--neutral-300" },
      { name: "400", value: "#9CA5B2", cssVariable: "--neutral-400" },
      { name: "500", value: "#727B89", cssVariable: "--neutral-500" },
      { name: "600", value: "#555E6C", cssVariable: "--neutral-600" },
      { name: "700", value: "#3F4652", cssVariable: "--neutral-700" },
      { name: "800", value: "#2E343D", cssVariable: "--neutral-800" },
      { name: "900", value: "#232830", cssVariable: "--neutral-900" },
      { name: "950", value: "#181C22", cssVariable: "--neutral-950" },
    ],
  },
];

export const semanticColors = [
  { name: "Action / primary", cssVariable: "--action-primary" },
  { name: "Action / accent", cssVariable: "--action-accent" },
  { name: "Text / primary", cssVariable: "--text-primary" },
  { name: "Text / secondary", cssVariable: "--text-secondary" },
  { name: "Border / default", cssVariable: "--border-default" },
  { name: "Status / success", cssVariable: "--status-success" },
  { name: "Status / warning", cssVariable: "--status-warning" },
  { name: "Status / error", cssVariable: "--status-error" },
] as const;

export const typographySamples = [
  { label: "Display Large · 56", className: "type-display-large" },
  { label: "Display Medium · 48", className: "type-display-medium" },
  { label: "Heading 1 · 40", className: "type-h1" },
  { label: "Heading 2 · 32", className: "type-h2" },
  { label: "Heading 3 · 24", className: "type-h3" },
  { label: "Title Large · 20", className: "type-title-large" },
  { label: "Title Medium · 18", className: "type-title-medium" },
  { label: "Body Large · 18", className: "type-body-large" },
  { label: "Body Medium · 16", className: "type-body-medium" },
  { label: "Body Small · 14", className: "type-body-small" },
  { label: "Label · 14", className: "type-label" },
  { label: "Caption · 12", className: "type-caption" },
] as const;

export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80] as const;

export const radiusScale = [
  { name: "Small", value: "8px", className: "rounded-sm" },
  { name: "Medium", value: "12px", className: "rounded-md" },
  { name: "Large", value: "16px", className: "rounded-lg" },
  { name: "Extra large", value: "24px", className: "rounded-xl" },
  { name: "Full", value: "999px", className: "rounded-full" },
] as const;
