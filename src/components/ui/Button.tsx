import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  gaEvent?: string;
  gaButton?: string;
  gaPlan?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  gaEvent,
  gaButton,
  gaPlan,
}: Props) {
  return (
    <Link
      href={href}
      data-ga-event={gaEvent}
      data-ga-button={gaButton}
      data-ga-plan={gaPlan}
      className={`ui-button ui-button-${variant} ${className}`}
    >
      {children}
    </Link>
  );
}
