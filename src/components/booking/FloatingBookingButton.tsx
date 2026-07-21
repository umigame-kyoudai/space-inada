"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

function detectLocale(pathname: string): Locale | "ja" {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
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

  const label = locale === "ja" ? "LINEで予約" : getDictionary(locale).nav.bookCta;
  const ariaLabel = locale === "ja" ? "LINEで予約・相談する" : getDictionary(locale).nav.bookCta;

  return (
    <Link
      href={`${bookingPath}${locale === "ja" ? "?from=floating" : ""}`}
      data-ga-event="reservation_click"
      data-ga-button="floating"
      aria-label={ariaLabel}
      className="fixed bottom-5 right-4 z-50 flex h-14 items-center gap-2 rounded-lg border border-[#052e16]/30 bg-[#06C755] px-6 text-sm font-bold text-[#052e16] shadow-lg shadow-[#06C755]/30 transition-transform hover:scale-105 sm:right-6"
    >
      <span aria-hidden className="text-lg">💬</span>
      {label}
    </Link>
  );
}
