import type { ReactNode } from "react";

import type { BreadcrumbItem } from "@/components/layout/breadcrumb";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumb?: readonly BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <header className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="grid max-w-3xl gap-3">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div>
          {eyebrow && (
            <p className="type-label mb-2 text-action-primary">{eyebrow}</p>
          )}
          <h1 className="type-h1 text-text-primary">{title}</h1>
          {description && (
            <p className="type-body-large mt-3 max-w-2xl text-text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-3 sm:justify-end">{actions}</div>}
    </header>
  );
}
