"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  languageLinksFor,
  type Locale,
  type TranslatedPageKey,
} from "@/lib/i18n/locales";

const SHORT_LABEL: Record<"ja" | Locale, string> = {
  ja: "JA",
  en: "EN",
  ko: "KO",
  zh: "中",
};

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
 * 常時表示の言語切り替え（🌐 + 現在の言語）。スマホ含め全ての画面幅でヘッダーに出す。
 * 外国人観光客が日本語ページに来ても、ハンバーガーメニューを開かずに一目で
 * 「言語を変えられる」と気づけるようにするための入口。
 */
export function LanguageMenuButton() {
  const pathname = usePathname() ?? "/";
  const { locale: current, jaPath } = splitLocale(pathname);
  const page = resolvePage(jaPath);
  const links = page ? languageLinksFor(page) : { ja: "/", en: "/en", ko: "/ko", zh: "/zh" };
  const order: ("ja" | Locale)[] = ["ja", "en", "ko", "zh"];

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Language / 言語: ${LOCALE_LABELS[current]}`}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-teal-200/15 bg-white/[0.03] px-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:border-amber-200/50 hover:bg-white/10"
      >
        <span aria-hidden className="text-base leading-none">🌐</span>
        <span>{SHORT_LABEL[current]}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Language / 言語"
          className="absolute right-0 top-[calc(100%+8px)] z-[70] w-44 overflow-hidden rounded-xl border border-teal-200/15 bg-[#0a0e1a] shadow-2xl shadow-black/40"
        >
          {order.map((locale) => {
            const active = locale === current;
            return (
              <Link
                key={locale}
                href={links[locale]}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-2 px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-teal-200/10 font-bold text-teal-200"
                    : "text-zinc-200 hover:bg-white/5 hover:text-amber-100"
                }`}
              >
                {LOCALE_LABELS[locale]}
                {active && (
                  <span aria-hidden className="text-teal-200">
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
