"use client";

import Script from "next/script";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, gaPush, isGaEnabled, trackEvent } from "@/lib/analytics";
import { ClickTracker } from "./ClickTracker";

/**
 * App Router ではクライアント遷移で自動ページビューが飛ばないため、
 * config を send_page_view: false にした上で pathname / searchParams の
 * 変化を監視して page_view を手動送信する（初回表示も遷移もこの1経路のみ＝二重計測なし）。
 * page_location に完全なURLを渡すので、UTM パラメータや参照元もそのまま計測される。
 * useSearchParams は Suspense 境界が必須。
 */
// 直近に送った page_view のURL。動的ルートへの遷移では searchParams の
// オブジェクト同一性が変わって effect が再実行されることがあるため、
// モジュール変数で同一URLへの二重送信を確実に防ぐ（再マウントにも耐える）。
let lastTrackedUrl: string | null = null;

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const url = query ? `${pathname}?${query}` : pathname;
    if (url === lastTrackedUrl) return;
    lastTrackedUrl = url;
    trackEvent("page_view", {
      page_location: window.location.href,
    });
  }, [pathname, query]);

  return null;
}

export function GoogleAnalytics() {
  // localhost 判定に window が必要なため、マウント後に有効化する
  // （SSRとクライアントの描画差異＝ハイドレーション不一致を避ける）。
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isGaEnabled()) return;
    // gtag.js のロードを待たずに dataLayer へ直接キューする。
    // この効果は子（PageviewTracker 等）のマウントより先に実行されるので、
    // config が必ず最初のイベントより前に積まれる。
    window.gtag = gaPush;
    gaPush("js", new Date());
    gaPush("config", GA_MEASUREMENT_ID, { send_page_view: false });
    // マウント後に一度だけクライアント環境を判定して有効化する正規パターン
    // （SSRと初回描画は無効→ハイドレーション安全）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <ClickTracker />
    </>
  );
}
