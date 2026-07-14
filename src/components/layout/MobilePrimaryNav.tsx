"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTestimonials } from "@/data/testimonials";

const primaryPages = [
  { href: "/", label: "ホーム", match: (path: string) => path === "/" },
  {
    href: "/plans",
    label: "プラン",
    match: (path: string) => path.startsWith("/plans"),
  },
  {
    href: "/gallery",
    label: "写真",
    match: (path: string) => path.startsWith("/gallery"),
  },
  // 口コミは実際の声が1件以上あるときだけ表示（data/testimonials.ts に追加で自動復帰）
  ...(getTestimonials().length > 0
    ? [
        {
          href: "/voice",
          label: "口コミ",
          match: (path: string) => path.startsWith("/voice"),
        },
      ]
    : []),
  {
    href: "/booking?from=mobile-nav",
    label: "予約",
    match: (path: string) => path.startsWith("/booking"),
  },
];

export function MobilePrimaryNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="主要ページ"
      className={`grid h-12 border-t border-teal-200/10 bg-[#03040a]/94 md:hidden ${
        primaryPages.length === 5 ? "grid-cols-5" : "grid-cols-4"
      }`}
    >
      {primaryPages.map((item) => {
        const active = item.match(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            data-ga-event={
              item.href.startsWith("/booking") ? "reservation_click" : undefined
            }
            data-ga-button={
              item.href.startsWith("/booking") ? "mobile_nav" : undefined
            }
            aria-current={active ? "page" : undefined}
            className={`relative flex min-w-0 items-center justify-center transition-colors ${
              active
                ? "text-amber-100"
                : "text-zinc-400 hover:text-teal-100"
            }`}
          >
            <span className="text-xs font-semibold tracking-[0.08em]">
              {item.label}
            </span>
            <span
              aria-hidden
              className={`absolute inset-x-3 bottom-0 h-0.5 origin-center rounded-full bg-gradient-to-r from-amber-300 via-teal-200 to-pink-300 transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
