"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type NavItem = { href: string; label: string };

/** スマホ用ハンバーガーメニュー（md未満で表示）。 */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  // Escで閉じる + 開いている間はスクロールロック
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-200/10 text-zinc-200 hover:border-teal-200/40 hover:bg-white/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open &&
        createPortal(
        <div
          id="mobile-menu"
          // body 直下に portal する。ヘッダーの backdrop-blur が fixed の包含ブロックに
          // なってしまい 64px の帯に閉じ込められる問題を回避する。完全不透明で背景は透けない。
          className="fixed inset-0 z-[60] overflow-y-auto bg-[#03040a] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="サイトメニュー"
        >
          <div className="flex h-16 items-center justify-between px-5">
            <span className="text-base font-bold text-white">メニュー</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="メニューを閉じる"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-200/10 text-zinc-200 hover:border-teal-200/40 hover:bg-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="px-5 pt-4" aria-label="モバイルナビ">
            <ul className="flex flex-col divide-y divide-teal-200/10">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 text-lg font-medium text-zinc-100 hover:text-teal-200"
                  >
                    {item.label}
                    <span aria-hidden className="text-amber-300">→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/booking?from=mobile-menu"
              onClick={() => setOpen(false)}
              className="mt-8 flex h-14 items-center justify-center rounded-lg border border-amber-300/70 bg-amber-300 text-base font-bold text-zinc-950 shadow-lg shadow-amber-300/15"
            >
              LINEで予約・相談する
            </Link>

            <div className="mt-8 flex justify-center gap-5 text-xs text-zinc-500">
              <Link href="/privacy" onClick={() => setOpen(false)}>
                プライバシーポリシー
              </Link>
              <Link href="/legal" onClick={() => setOpen(false)}>
                特定商取引法に基づく表記
              </Link>
            </div>
          </nav>
        </div>,
          document.body,
        )}
    </div>
  );
}
