import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/seo";
import { getPlans } from "@/data/plans";
import { getTestimonials } from "@/data/testimonials";

/**
 * Footer は全ページ共通の内部リンクハブ兼 NAP 掲示（ローカルSEO）。
 */
export function Footer() {
  const plans = getPlans();
  const instagramUrl = siteConfig.sameAs.find((u) => u.includes("instagram.com"));
  return (
    <footer className="mt-auto border-t border-teal-200/10 bg-[#03040a]/95 text-zinc-400">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="inline-flex items-center gap-2 text-base font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.75)]" />
            {siteConfig.name}
          </p>
          <p className="mt-3 text-sm leading-relaxed">{siteConfig.description}</p>
        </div>

        <nav aria-label="プラン">
          <p className="text-sm font-semibold text-teal-100">撮影プラン</p>
          <ul className="mt-3 space-y-2 text-sm">
            {plans.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/plans/${p.slug}`}
                  data-ga-event="plan_click"
                  data-ga-button="footer"
                  data-ga-plan={p.name}
                  className="hover:text-teal-200"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="サイト">
          <p className="text-sm font-semibold text-teal-100">サイト</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/booking?from=footer"
                data-ga-event="reservation_click"
                data-ga-button="footer"
                className="font-semibold text-amber-300 hover:text-teal-200"
              >
                ご予約・相談（LINE）
              </Link>
            </li>
            <li><Link href="/gallery" className="hover:text-teal-200">撮影ギャラリー</Link></li>
            {getTestimonials().length > 0 && (
              <li><Link href="/voice" className="hover:text-teal-200">お客様の声</Link></li>
            )}
            <li><Link href="/about" className="hover:text-teal-200">私たちについて</Link></li>
            <li><Link href="/blog" className="hover:text-teal-200">コラム</Link></li>
            <li><Link href="/faq" className="hover:text-teal-200">よくある質問</Link></li>
            <li><Link href="/access" className="hover:text-teal-200">アクセス</Link></li>
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-teal-100">お問い合わせ</p>
          <address className="mt-3 space-y-1 text-sm not-italic">
            <p>対応エリア：{siteConfig.contact.areaServed}</p>
            <p>営業時間：{siteConfig.hours.opens}〜{siteConfig.hours.closes}</p>
            {siteConfig.contact.telephone ? (
              <p>
                TEL：
                <a
                  href={`tel:${siteConfig.contact.telephone}`}
                  data-ga-event="phone_click"
                  data-ga-button="footer"
                  className="hover:text-teal-200"
                >
                  {siteConfig.contact.telephone}
                </a>
              </p>
            ) : null}
            <p>
              Email：
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-teal-200">
                {siteConfig.contact.email}
              </a>
            </p>
            {instagramUrl ? (
              <p>
                Instagram：
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ga-event="instagram_click"
                  data-ga-button="footer"
                  className="hover:text-teal-200"
                >
                  @{instagramUrl.split("/").filter(Boolean).pop()}
                </a>
              </p>
            ) : null}
          </address>
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-teal-200/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav aria-label="法務" className="flex gap-4 text-xs">
          <Link href="/privacy" className="hover:text-teal-200">
            プライバシーポリシー
          </Link>
          <Link href="/legal" className="hover:text-teal-200">
            特定商取引法に基づく表記
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
