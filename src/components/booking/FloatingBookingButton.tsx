"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 全ページ追従の予約フローティングボタン（モバイルCV強化）。
 * /booking 上では重複するため非表示。
 * クリック計測は data-ga-* 属性（ClickTracker が拾う）。
 */
export function FloatingBookingButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/booking")) return null;

  return (
    <Link
      href="/booking?from=floating"
      data-ga-event="reservation_click"
      data-ga-button="floating"
      aria-label="LINEで予約・相談する"
      className="fixed bottom-5 right-4 z-50 flex h-14 items-center gap-2 rounded-lg border border-[#052e16]/30 bg-[#06C755] px-6 text-sm font-bold text-[#052e16] shadow-lg shadow-[#06C755]/30 transition-transform hover:scale-105 sm:right-6"
    >
      <span aria-hidden className="text-lg">💬</span>
      LINEで予約
    </Link>
  );
}
