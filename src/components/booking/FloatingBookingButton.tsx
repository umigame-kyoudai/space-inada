"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

function detectLocale(pathname: string): Locale | "ja" {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
      return locale;
  }
  return "ja";
}

/**
 * 全ページ追従の予約フローティングボタン（モバイルCV強化）。
 * 予約ページ上では重複するため非表示。翻訳ページでは対応言語の予約ページへリンクする。
 * クリック計測は data-ga-* 属性（ClickTracker が拾う）。
 */
export function FloatingBookingButton() {
  const pathname = usePathname() ?? "/";
  const locale = detectLocale(pathname);
  const bookingPath = locale === "ja" ? "/booking" : `/${locale}/booking`;
  const isHome = pathname === "/" || pathname === `/${locale}`;
  const [visibility, setVisibility] = useState({ pathname: "", hidden: true });

  useEffect(() => {
    if (pathname.startsWith(bookingPath)) return;
    // ページ内の予約導線を優先し、追従ボタンによる遮蔽やプラン指定の取り違えを防ぐ。
    const targets: Element[] = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        "main a[href], footer a[href]",
      ),
    ).filter((link) => new URL(link.href).pathname === bookingPath);
    const hero = isHome ? document.getElementById("home-hero") : null;
    if (hero) targets.push(hero);
    const visibleTargets = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        }
        setVisibility({ pathname, hidden: visibleTargets.size > 0 });
      },
      { rootMargin: "0px 0px 96px 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [bookingPath, isHome, pathname]);

  if (pathname.startsWith(bookingPath)) return null;
  if (visibility.pathname !== pathname || visibility.hidden) return null;

  const label =
    locale === "ja" ? "LINEで予約" : getDictionary(locale).nav.bookCta;
  const ariaLabel =
    locale === "ja"
      ? "LINEで予約・相談する"
      : getDictionary(locale).nav.bookCta;

  return (
    <Link
      href={`${bookingPath}${locale === "ja" ? "?from=floating" : ""}`}
      data-ga-event="reservation_click"
      data-ga-button="floating"
      aria-label={ariaLabel}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex min-h-12 items-center gap-3 rounded-full border border-accent bg-accent px-5 text-xs font-medium text-on-accent shadow-lg shadow-night/10 md:hidden"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M21 11.5c0 4.7-4 8.5-9 8.5H4l-2 2v-10.5C2 6.8 6 3 11 3h1c5 0 9 3.8 9 8.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M7 10h9M7 14h6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {label}
    </Link>
  );
}
