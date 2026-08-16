import type { ReactNode } from "react";

export function PreviewSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-6 max-w-2xl">
        <h2 id={`${id}-title`} className="type-h3 text-text-primary">
          {title}
        </h2>
        {description && (
          <p className="type-body-medium mt-2 text-text-secondary">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
