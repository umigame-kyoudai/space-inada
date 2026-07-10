"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GA_MEASUREMENT_ID, gaPush, isGaEnabled } from "@/lib/analytics";
import { ClickTracker } from "./ClickTracker";

/**
 * GA4（gtag.js）のローダー。
 *
 * page_view の計測はすべて gtag に任せる:
 * - 初回表示: config の既定動作（send_page_view: true）
 * - App Router のクライアント遷移: GA4 の拡張計測
 *   「ブラウザの履歴イベントに基づくページの変更」（既定でON）が自動送信
 * 手動送信と併用すると遷移時に二重計測になるため、手動 page_view は送らない。
 * ※GA4 管理画面 → データストリーム → 拡張計測の「履歴イベント」はONのままにすること。
 * UTM 付きURLや参照元は page_view の page_location / page_referrer として保持される。
 */
export function GoogleAnalytics() {
  // localhost 判定に window が必要なため、マウント後に有効化する
  // （SSRとクライアントの描画差異＝ハイドレーション不一致を避ける）。
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isGaEnabled()) return;
    // gtag.js のロードを待たずに dataLayer へ直接キューする
    // （ロード後にまとめて処理されるので、初回 page_view も取りこぼさない）。
    window.gtag = gaPush;
    gaPush("js", new Date());
    gaPush("config", GA_MEASUREMENT_ID);
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
      <ClickTracker />
    </>
  );
}
