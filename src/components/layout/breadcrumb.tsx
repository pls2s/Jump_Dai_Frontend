import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="type-body-small flex flex-wrap items-center gap-1.5 text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="size-3.5 text-text-tertiary" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-text-primary hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
