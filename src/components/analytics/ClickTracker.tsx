"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * data-ga-event 属性が付いた要素のクリックを document で一括計測する。
 * サーバーコンポーネントのリンクにも属性を書くだけで計測でき、
 * ボタンごとに onClick（＝クライアントコンポーネント化）を足さずに済む。
 *
 * 使い方:
 *   <Link data-ga-event="reservation_click" data-ga-button="header" ...>
 *   <a data-ga-event="plan_click" data-ga-button="plan_card" data-ga-plan="スタンダード" ...>
 *
 * button_name = data-ga-button、plan_name = data-ga-plan、
 * link_url は要素の href から自動取得。page_path / page_title は trackEvent が付与する。
 */
export function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el =
        e.target instanceof Element
          ? e.target.closest("[data-ga-event]")
          : null;
      if (!(el instanceof HTMLElement) || !el.dataset.gaEvent) return;

      const params: Record<string, unknown> = {};
      if (el.dataset.gaButton) params.button_name = el.dataset.gaButton;
      if (el.dataset.gaPlan) params.plan_name = el.dataset.gaPlan;
      const href = el.getAttribute("href");
      if (href) params.link_url = href;
      trackEvent(el.dataset.gaEvent, params);
    }
    // capture: 他のハンドラが stopPropagation してもクリックを取りこぼさない
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
