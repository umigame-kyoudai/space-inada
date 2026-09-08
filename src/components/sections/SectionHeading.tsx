import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  title,
  eyebrow,
  href,
  linkLabel = "すべて見る",
  subtitle,
  reveal = false,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  subtitle?: ReactNode;
  reveal?: boolean;
}) {
  return (
    <div className={`section-heading${reveal ? " reveal-up" : ""}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="cosmic-title">{title}</h2>
        {subtitle && (
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link href={href} className="section-heading-link">
          {linkLabel}
          <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}
