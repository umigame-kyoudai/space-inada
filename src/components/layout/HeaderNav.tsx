"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";

const jaNav = [
  { href: "/plans", label: "プラン" },
  { href: "/gallery", label: "ギャラリー" },
  { href: "/about", label: "私たちについて" },
  { href: "/blog", label: "コラム" },
  { href: "/faq", label: "よくある質問" },
  { href: "/access", label: "アクセス" },
] as const;

function detectLocale(pathname: string): Locale | "ja" {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return "ja";
}

/**
 * ヘッダーのナビ・予約CTA・モバイルメニュー・言語切り替えをまとめたクライアント部分。
 * 現在のURLから言語を自動判定し、翻訳ページでは翻訳済みナビ・CTAに切り替える。
 * 日本語ページの見た目・挙動はこれまでと完全に同じ。
 */
export function HeaderNav({ showVoice }: { showVoice: boolean }) {
  const pathname = usePathname() ?? "/";
  const locale = detectLocale(pathname);

  if (locale === "ja") {
    const nav = showVoice
      ? [...jaNav.slice(0, 2), { href: "/voice", label: "お客様の声" }, ...jaNav.slice(2)]
      : [...jaNav];
    return (
      <>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-teal-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden lg:flex" />
          <Link
            href="/booking?from=header"
            data-ga-event="reservation_click"
            data-ga-button="header"
            className="hidden h-10 items-center rounded-lg border border-amber-300/70 bg-amber-300 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-300/10 transition-all hover:bg-amber-200 sm:inline-flex"
          >
            予約する
          </Link>
          <MobileMenu items={nav} />
        </div>
      </>
    );
  }

  const dict = getDictionary(locale);
  const localNav = [
    { href: `/${locale}/plans`, label: dict.nav.plans },
    { href: `/${locale}/access`, label: dict.nav.access },
    { href: `/${locale}/faq`, label: dict.nav.faq },
  ];

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {localNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-zinc-300 transition-colors hover:text-teal-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <LanguageSwitcher className="hidden lg:flex" />
        <Link
          href={`/${locale}/booking`}
          data-ga-event="reservation_click"
          data-ga-button="header"
          className="hidden h-10 items-center rounded-lg border border-amber-300/70 bg-amber-300 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-300/10 transition-all hover:bg-amber-200 sm:inline-flex"
        >
          {dict.nav.bookCta}
        </Link>
        <MobileMenu
          items={localNav}
          bookingHref={`/${locale}/booking`}
          bookingLabel={dict.nav.bookCta}
          backToJapaneseHref="/"
          backToJapaneseLabel={dict.nav.backToJapanese}
        />
      </div>
    </>
  );
}
