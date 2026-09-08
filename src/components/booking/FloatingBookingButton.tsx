"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  if (pathname.startsWith(bookingPath)) return null;

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
