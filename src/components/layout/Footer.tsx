"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Brand } from "@/components/ui/Brand";
import { siteConfig } from "@/lib/seo";
import { getPlans } from "@/data/plans";
import { getTestimonials } from "@/data/testimonials";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

function detectLocale(pathname: string): Locale | "ja" {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return "ja";
}

/**
 * Footer は全ページ共通の内部リンクハブ兼 NAP 掲示（ローカルSEO）。
 * URL から言語を自動判定し、翻訳ページでは対応する言語のラベル・リンクに切り替える。
 * 未翻訳ページ（ギャラリー・About・コラム・法務ページ）は日本語ページへリンクする。
 */
export function Footer() {
  const pathname = usePathname() ?? "/";
  const locale = detectLocale(pathname);
  const plans = getPlans();
  const instagramUrl = siteConfig.sameAs.find((u) => u.includes("instagram.com"));
  const dict = locale === "ja" ? null : getDictionary(locale);
  const prefix = locale === "ja" ? "" : `/${locale}`;

  return (
    <footer className="site-footer">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={prefix || "/"} aria-label={siteConfig.name}><Brand /></Link>
          <p className="mt-5 text-xs leading-7">{siteConfig.description}</p>
        </div>

        <nav aria-label="プラン">
          <p className="text-sm font-semibold text-accent">
            {dict ? dict.footer.plansHeading : "撮影プラン"}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {plans.map((p) => {
              const name = dict ? dict.planOverlay[p.slug].name : p.name;
              return (
                <li key={p.slug}>
                  <Link
                    href={`${prefix}/plans/${p.slug}`}
                    data-ga-event="plan_click"
                    data-ga-button="footer"
                    data-ga-plan={p.name}
                    className="hover:text-accent"
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label="サイト">
          <p className="text-sm font-semibold text-accent">
            {dict ? dict.footer.siteHeading : "サイト"}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href={`${prefix}/booking${locale === "ja" ? "?from=footer" : ""}`}
                data-ga-event="reservation_click"
                data-ga-button="footer"
                className="font-semibold text-accent hover:text-accent"
              >
                {dict ? dict.footer.bookCta : "ご予約・相談（LINE）"}
              </Link>
            </li>
            {!dict && (
              <>
                <li><Link href="/gallery" className="hover:text-accent">撮影ギャラリー</Link></li>
                {getTestimonials().length > 0 && (
                  <li><Link href="/voice" className="hover:text-accent">お客様の声</Link></li>
                )}
                <li><Link href="/about" className="hover:text-accent">私たちについて</Link></li>
                <li><Link href="/blog" className="hover:text-accent">コラム</Link></li>
              </>
            )}
            <li>
              <Link href={`${prefix}/faq`} className="hover:text-accent">
                {dict ? dict.footer.faq : "よくある質問"}
              </Link>
            </li>
            <li>
              <Link href={`${prefix}/access`} className="hover:text-accent">
                {dict ? dict.footer.access : "アクセス"}
              </Link>
            </li>
            {dict && (
              <>
                <li>
                  <Link href="/gallery" className="hover:text-accent">
                    {dict.footer.gallery} <span className="text-muted">{dict.footer.japaneseOnly}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-accent">
                    {dict.footer.about} <span className="text-muted">{dict.footer.japaneseOnly}</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-accent">
            {dict ? dict.footer.contactHeading : "お問い合わせ"}
          </p>
          <address className="mt-3 space-y-1 text-sm not-italic">
            <p>
              {dict ? dict.footer.areaServed : "対応エリア"}：{siteConfig.contact.areaServed}
            </p>
            <p>
              {dict ? dict.footer.hours : "撮影時間"}：{siteConfig.hours.label}
            </p>
            {siteConfig.contact.telephone ? (
              <p>
                TEL：
                <a
                  href={`tel:${siteConfig.contact.telephone}`}
                  data-ga-event="phone_click"
                  data-ga-button="footer"
                  className="hover:text-accent"
                >
                  {siteConfig.contact.telephone}
                </a>
              </p>
            ) : null}
            <p>
              Email：
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
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
                  className="hover:text-accent"
                >
                  @{instagramUrl.split("/").filter(Boolean).pop()}
                </a>
              </p>
            ) : null}
          </address>
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav aria-label="法務" className="flex gap-4 text-xs">
          <Link href="/privacy" className="hover:text-accent">
            {dict ? (
              <>
                {dict.footer.privacy} <span className="text-muted">{dict.footer.japaneseOnly}</span>
              </>
            ) : (
              "プライバシーポリシー"
            )}
          </Link>
          <Link href="/legal" className="hover:text-accent">
            {dict ? (
              <>
                {dict.footer.legal} <span className="text-muted">{dict.footer.japaneseOnly}</span>
              </>
            ) : (
              "特定商取引法に基づく表記"
            )}
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
