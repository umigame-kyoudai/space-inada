"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTestimonials } from "@/data/testimonials";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

function detectLocale(pathname: string): Locale | "ja" {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return "ja";
}

function localizedPrimaryPages(locale: Locale) {
  const dict = getDictionary(locale);
  return [
    { href: `/${locale}`, label: "Top", match: (path: string) => path === `/${locale}` },
    {
      href: `/${locale}/plans`,
      label: dict.nav.plans,
      match: (path: string) => path.startsWith(`/${locale}/plans`),
    },
    {
      href: `/${locale}/access`,
      label: dict.nav.access,
      match: (path: string) => path.startsWith(`/${locale}/access`),
    },
    {
      href: `/${locale}/booking`,
      label: dict.nav.bookCta,
      match: (path: string) => path.startsWith(`/${locale}/booking`),
    },
  ];
}

const primaryPages = [
  { href: "/", label: "ホーム", match: (path: string) => path === "/" },
  {
    href: "/plans",
    label: "プラン",
    match: (path: string) => path.startsWith("/plans"),
  },
  {
    href: "/gallery",
    label: "写真",
    match: (path: string) => path.startsWith("/gallery"),
  },
  // 口コミは実際の声が1件以上あるときだけ表示（data/testimonials.ts に追加で自動復帰）
  ...(getTestimonials().length > 0
    ? [
        {
          href: "/voice",
          label: "口コミ",
          match: (path: string) => path.startsWith("/voice"),
        },
      ]
    : []),
  {
    href: "/booking?from=mobile-nav",
    label: "予約",
    match: (path: string) => path.startsWith("/booking"),
  },
];

export function MobilePrimaryNav() {
  const pathname = usePathname() ?? "/";
  const locale = detectLocale(pathname);
  const pages = locale === "ja" ? primaryPages : localizedPrimaryPages(locale);

  return (
    <nav
      aria-label="主要ページ"
      className={`grid h-12 border-t border-line bg-paper md:hidden ${
        pages.length === 5 ? "grid-cols-5" : "grid-cols-4"
      }`}
    >
      {pages.map((item) => {
        const active = item.match(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            data-ga-event={
              item.href.startsWith("/booking") ? "reservation_click" : undefined
            }
            data-ga-button={
              item.href.startsWith("/booking") ? "mobile_nav" : undefined
            }
            aria-current={active ? "page" : undefined}
            className={`relative flex min-w-0 items-center justify-center transition-colors ${
              active
                ? "text-accent"
                : "text-muted hover:text-accent"
            }`}
          >
            <span className="text-xs font-semibold tracking-[0.08em]">
              {item.label}
            </span>
            <span
              aria-hidden
              className={`absolute inset-x-3 bottom-0 h-0.5 origin-center rounded-full bg-accent transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
