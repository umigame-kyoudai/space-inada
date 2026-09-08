"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { MobileMenu } from "./MobileMenu";
import { LanguageMenuButton } from "./LanguageMenuButton";

const jaNav = [
  { href: "/plans", label: "撮影プラン" },
  { href: "/gallery", label: "ギャラリー" },
  { href: "/about", label: "私たちについて" },
  { href: "/blog", label: "コラム" },
  { href: "/faq", label: "よくある質問" },
  { href: "/access", label: "アクセス" },
];

export function HeaderNav({ showVoice }: { showVoice: boolean }) {
  const pathname = usePathname() ?? "/";
  const locale = SUPPORTED_LOCALES.find(
    (item) => pathname === `/${item}` || pathname.startsWith(`/${item}/`),
  );
  const dict = locale ? getDictionary(locale) : null;
  const nav = dict
    ? [
        { href: `/${locale}/plans`, label: dict.nav.plans },
        { href: `/${locale}/access`, label: dict.nav.access },
        { href: `/${locale}/faq`, label: dict.nav.faq },
      ]
    : showVoice
      ? [
          ...jaNav.slice(0, 2),
          { href: "/voice", label: "お客様の声" },
          ...jaNav.slice(2),
        ]
      : jaNav;
  const bookingHref = locale ? `/${locale}/booking` : "/booking?from=header";

  return (
    <>
      <nav
        aria-label={locale ? "Main navigation" : "メインナビゲーション"}
        className="hidden items-center gap-5 xl:flex"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="header-link whitespace-nowrap"
            aria-current={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "page"
                : undefined
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <LanguageMenuButton />
        <Link
          href={bookingHref}
          data-ga-event="reservation_click"
          data-ga-button="header"
          className="ui-button ui-button-primary hidden min-h-11 px-5 sm:inline-flex"
        >
          {dict ? dict.nav.bookCta : "予約・相談"}
          <span aria-hidden="true">↗</span>
        </Link>
        <MobileMenu
          items={nav}
          bookingHref={locale ? bookingHref : undefined}
          bookingLabel={dict?.nav.bookCta}
          backToJapaneseHref={locale ? "/" : undefined}
        />
      </div>
    </>
  );
}
