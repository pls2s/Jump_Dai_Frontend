export type NavigationIcon =
  | "home"
  | "courses"
  | "create"
  | "sources"
  | "analytics"
  | "account"
  | "learning"
  | "evidence"
  | "learners"
  | "skills"
  | "settings"
  | "components";

export interface NavigationItem {
  label: string;
  href: string;
  icon: NavigationIcon;
  current?: boolean;
}
