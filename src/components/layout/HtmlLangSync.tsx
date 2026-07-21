"use client";

import { useEffect } from "react";

/**
 * ルートレイアウトの <html lang="ja"> は全ロケール共通で固定のため、
 * 翻訳ページ（/en, /ko, /zh）ではマウント後に document.documentElement.lang を
 * 実際の言語へ差し替える。スクリーンリーダー等の言語判定を正しくするための補助。
 * （初回HTMLの lang 属性自体は "ja" のままだが、hreflang タグで検索エンジンへは
 *   正しい言語を伝えている）
 */
export function HtmlLangSync({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);
  return null;
}
