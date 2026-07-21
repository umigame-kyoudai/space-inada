/**
 * 多言語対応（英語・韓国語・中国語）の基盤設定。
 *
 * 設計方針：
 * - 日本語ページの URL・構造・順位は一切変更しない（/、/plans、/access… はそのまま）。
 * - 翻訳ページは "/en" "/ko" "/zh" 配下に独立したルートとして追加するだけ。
 * - 翻訳対象は観光客が予約前に読む主要ページのみ（トップ・プラン・アクセス・FAQ・予約）。
 *   ブログ・ギャラリー・About等は日本語のみ（未対応）。
 */

export const SUPPORTED_LOCALES = ["en", "ko", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE = "ja" as const;

/** サイト表示用のラベル（言語切り替えメニュー等） */
export const LOCALE_LABELS: Record<Locale | "ja", string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  // 宮古島は台湾からの観光客が多いため繁体字中文を採用
  zh: "繁體中文",
};

/** hreflang / og:locale 用の言語タグ */
export const LOCALE_HREFLANG: Record<Locale | "ja", string> = {
  ja: "ja",
  en: "en",
  ko: "ko",
  zh: "zh-Hant",
};

/** <html lang> に使う値 */
export const LOCALE_HTML_LANG: Record<Locale | "ja", string> = {
  ja: "ja",
  en: "en",
  ko: "ko",
  zh: "zh-TW",
};

/** og:locale 用（Facebook等が期待する形式） */
export const LOCALE_OG: Record<Locale | "ja", string> = {
  ja: "ja_JP",
  en: "en_US",
  ko: "ko_KR",
  zh: "zh_TW",
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * 翻訳ページが存在する主要ページの識別子。
 * 各ロケールの page.tsx はこれを指定して、hreflang とナビ・言語切り替えの
 * リンク先を自動的に決める。
 */
export type TranslatedPageKey =
  | "home"
  | "plans"
  | { key: "planDetail"; slug: string }
  | "access"
  | "faq"
  | "booking";

/** ページ識別子 → 日本語ページの絶対パス */
function jaPathOf(page: TranslatedPageKey): string {
  if (typeof page === "object") return `/plans/${page.slug}`;
  switch (page) {
    case "home":
      return "/";
    case "plans":
      return "/plans";
    case "access":
      return "/access";
    case "faq":
      return "/faq";
    case "booking":
      return "/booking";
  }
}

/** ページ識別子 → 指定ロケールのパス（"/en" 等のプレフィックス付き） */
export function localizedPathOf(locale: Locale, page: TranslatedPageKey): string {
  const jaPath = jaPathOf(page);
  return jaPath === "/" ? `/${locale}` : `/${locale}${jaPath}`;
}

/**
 * 指定ページの「言語間リンク集」を返す（言語切り替えメニュー・hreflang 両方で使う）。
 * 例: { ja: "/plans/standard", en: "/en/plans/standard", ko: "...", zh: "..." }
 */
export function languageLinksFor(
  page: TranslatedPageKey,
): Record<Locale | "ja", string> {
  return {
    ja: jaPathOf(page),
    en: localizedPathOf("en", page),
    ko: localizedPathOf("ko", page),
    zh: localizedPathOf("zh", page),
  };
}

/** buildMetadata() の alternates.languages 用（hreflang タグ）。x-default は日本語ページ。 */
export function hreflangAlternates(
  page: TranslatedPageKey,
): Record<string, string> {
  const links = languageLinksFor(page);
  return {
    ja: links.ja,
    en: links.en,
    ko: links.ko,
    "zh-Hant": links.zh,
    "x-default": links.ja,
  };
}
