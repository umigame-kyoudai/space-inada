import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { getTestimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false, follow: true },
};

const links = [
  { href: "/", label: "トップページ" },
  { href: "/plans", label: "撮影プラン" },
  // お客様の声は実際の声が1件以上あるときだけ表示（data/testimonials.ts に追加で自動復帰）
  ...(getTestimonials().length > 0
    ? [{ href: "/voice", label: "お客様の声" }]
    : []),
  { href: "/blog", label: "星空フォトコラム" },
  { href: "/faq", label: "よくある質問" },
  { href: "/access", label: "アクセス" },
];

export default function NotFound() {
  return (
    <Section className="text-center">
      <p className="cosmic-kicker text-sm font-semibold tracking-widest">404</p>
      <h1 className="cosmic-title mt-4 text-3xl font-bold sm:text-4xl">
        お探しのページは見つかりませんでした
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
        URLが変更されたか、削除された可能性があります。
        下のリンクから目的のページをお探しください。
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/">トップへ戻る</Button>
        <Button
          href="/booking?from=not-found"
          variant="outline"
          gaEvent="reservation_click"
          gaButton="not_found"
        >
          LINEで予約・相談
        </Button>
      </div>

      <nav aria-label="サイト内リンク" className="mt-12">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-zinc-300 hover:text-teal-200">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Section>
  );
}
