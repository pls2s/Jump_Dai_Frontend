export type NavigationIcon =
  | "home"
  | "courses"
  | "create"
  | "sources"
  | "analytics"
  | "account"
  | "learning"
  | "evidence"
  | "settings"
  | "components";

export interface NavigationItem {
  label: string;
  href: string;
  icon: NavigationIcon;
  current?: boolean;
}
