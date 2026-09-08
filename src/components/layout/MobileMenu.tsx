"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  items: { href: string; label: string }[];
  bookingHref?: string;
  bookingLabel?: string;
  backToJapaneseHref?: string;
};

export function MobileMenu({
  items,
  bookingHref = "/booking?from=mobile-menu",
  bookingLabel = "LINEで予約・相談する",
  backToJapaneseHref,
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-11 w-11 items-center justify-center rounded border border-line text-ink"
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-menu"
        onClose={() => setOpen(false)}
        aria-label="サイトメニュー"
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-paper p-0 text-ink backdrop:bg-night/50"
      >
        <div className="flex h-20 items-center justify-between border-b border-line px-6">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
            className="flex h-11 w-11 items-center justify-center rounded border border-line text-2xl"
          >
            ×
          </button>
        </div>
        <nav className="px-6 pb-10 pt-8" aria-label="モバイルナビ">
          <p className="eyebrow mb-5">EXPLORE KEY PHOTO</p>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-5 font-serif text-xl text-ink"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="font-sans text-sm text-accent"
                  >
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={bookingHref}
            data-ga-event="reservation_click"
            data-ga-button="mobile_menu"
            onClick={() => setOpen(false)}
            className="ui-button ui-button-primary mt-8 w-full"
          >
            {bookingLabel}
            <span aria-hidden="true">↗</span>
          </Link>
          <div
            className="mt-8 border-t border-line pt-6"
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("a"))
                setOpen(false);
            }}
          >
            <p className="eyebrow mb-4 text-center">LANGUAGE / 言語</p>
            <LanguageSwitcher className="justify-center gap-5 text-sm" />
          </div>
          {!backToJapaneseHref && (
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-muted">
              <Link href="/privacy" onClick={() => setOpen(false)}>
                プライバシーポリシー
              </Link>
              <Link href="/legal" onClick={() => setOpen(false)}>
                特定商取引法に基づく表記
              </Link>
            </div>
          )}
        </nav>
      </dialog>
    </div>
  );
}
