import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  /** GA4 クリック計測（ClickTracker が data-ga-* 属性を拾う） */
  gaEvent?: string;
  gaButton?: string;
  gaPlan?: string;
};

const base =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-7 text-sm font-semibold transition-all";

const variants = {
  primary:
    "border border-amber-300/70 bg-amber-300 text-zinc-950 shadow-lg shadow-amber-300/15 hover:bg-teal-200 hover:shadow-teal-300/20",
  outline:
    "border border-teal-200/35 bg-slate-950/40 text-white hover:border-amber-200/70 hover:bg-white/[0.08] hover:text-amber-100",
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
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
