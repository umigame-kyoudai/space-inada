"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  languageLinksFor,
  type Locale,
  type TranslatedPageKey,
} from "@/lib/i18n/locales";

/** 現在の URL から「ロケール」と「日本語換算のパス」を求める。 */
function splitLocale(pathname: string): { locale: "ja" | Locale; jaPath: string } {
  for (const locale of SUPPORTED_LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length);
      return { locale, jaPath: rest === "" ? "/" : rest };
    }
  }
  return { locale: "ja", jaPath: pathname };
}

/** 日本語換算パス → 翻訳対応ページの識別子（対応外なら null） */
function resolvePage(jaPath: string): TranslatedPageKey | null {
  if (jaPath === "/") return "home";
  if (jaPath === "/plans") return "plans";
  if (jaPath === "/access") return "access";
  if (jaPath === "/faq") return "faq";
  if (jaPath === "/booking") return "booking";
  const planMatch = jaPath.match(/^\/plans\/([^/]+)\/?$/);
  if (planMatch) return { key: "planDetail", slug: planMatch[1] };
  return null;
}

/**
 * 現在の URL から自動的に対応言語ページを判定して切り替えリンクを出す。
 * 翻訳がないページ（ブログ・ギャラリー等）では各言語のトップページへフォールバックする。
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const { locale: current, jaPath } = splitLocale(pathname);
  const page = resolvePage(jaPath);
  const links = page ? languageLinksFor(page) : { ja: "/", en: "/en", ko: "/ko", zh: "/zh" };
  const order: ("ja" | Locale)[] = ["ja", "en", "ko", "zh"];

  return (
    <div className={`flex flex-wrap items-center gap-1 text-xs ${className}`}>
      {order.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden className="text-muted">
              /
            </span>
          )}
          {locale === current ? (
            <span className="font-semibold text-accent">{LOCALE_LABELS[locale]}</span>
          ) : (
            <Link href={links[locale]} className="text-muted hover:text-accent">
              {LOCALE_LABELS[locale]}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
