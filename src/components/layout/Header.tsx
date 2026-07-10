import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/seo";
import { getTestimonials } from "@/data/testimonials";
import { MobileMenu } from "./MobileMenu";
import { MobilePrimaryNav } from "./MobilePrimaryNav";

const nav = [
  { href: "/plans", label: "プラン" },
  { href: "/gallery", label: "ギャラリー" },
  // お客様の声は実際の声が1件以上あるときだけ表示（data/testimonials.ts に追加で自動復帰）
  ...(getTestimonials().length > 0
    ? [{ href: "/voice", label: "お客様の声" }]
    : []),
  { href: "/about", label: "私たちについて" },
  { href: "/blog", label: "コラム" },
  { href: "/faq", label: "よくある質問" },
  { href: "/access", label: "アクセス" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-teal-200/10 bg-[#03040a]/82 shadow-lg shadow-black/20 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2 text-base font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
          <span className="group-hover:text-amber-100">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-teal-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            href="/booking?from=header"
            data-ga-event="reservation_click"
            data-ga-button="header"
            className="hidden h-10 items-center rounded-lg border border-amber-300/70 bg-amber-300 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-300/10 transition-all hover:bg-teal-200 sm:inline-flex"
          >
            予約する
          </Link>
          <MobileMenu items={nav} />
        </div>
      </Container>
      <MobilePrimaryNav />
    </header>
  );
}
