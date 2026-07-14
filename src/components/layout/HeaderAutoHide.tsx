"use client";

import { useEffect } from "react";

/**
 * モバイルでの下スクロール中に <html data-header-collapsed="true"> を立てる。
 * 実際の格納は globals.css の .site-header 側（max-width: 767px のみ）で行うため、
 * このコンポーネント自体は何も描画しない。
 * - 上スクロール／ページ上部では必ず展開（誤格納でナビに戻れない事態を防ぐ）
 * - 小さな指の揺れで開閉がバタつかないよう 8px のしきい値を設ける
 */
export function HeaderAutoHide() {
  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < 128) {
          delete root.dataset.headerCollapsed;
        } else if (delta > 8) {
          root.dataset.headerCollapsed = "true";
        } else if (delta < -8) {
          delete root.dataset.headerCollapsed;
        }
        lastY = y;
      });
    }

    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      delete root.dataset.headerCollapsed;
    };
  }, []);

  return null;
}
