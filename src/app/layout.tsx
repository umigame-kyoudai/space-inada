import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { WebVitals } from "@/components/analytics/WebVitals";
import { FloatingBookingButton } from "@/components/booking/FloatingBookingButton";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const shipporiMincho = Shippori_Mincho({
  variable: "--font-display",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

/**
 * 全ページ共通メタの土台。
 * - metadataBase: 相対 canonical / OG 画像を絶対URL化
 * - title.template: 子ページの title に屋号を自動付与
 * - 既定 OG / Twitter: 子ページが上書きしなければ継承
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    // SEO: 検索される語（宮古島の星空フォト…）を先頭に、ブランド名は後ろに置く
    default: `宮古島の星空フォト・記念日撮影｜${siteConfig.name}`,
    template: `%s｜${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    // og:image はファイル規約 app/opengraph-image.jpg が全ページに自動付与
  },
  twitter: { card: siteConfig.twitter.card },
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  robots: { index: true, follow: true },
  // Google Search Console のHTMLタグ確認（環境変数で設定）
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#f5f7f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${shipporiMincho.variable} antialiased`}
    >
      <head>
        {/* GA は afterInteractive で遅延読込のため preconnect ではなく軽量な dns-prefetch のみ。
            重要リソースの接続枠を奪わずに名前解決だけ先行させる。 */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="cosmic-page flex min-h-screen flex-col text-ink">
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={localBusinessJsonLd()} />
        <ScrollProgress />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingBookingButton />
        <GoogleAnalytics />
        <WebVitals />
      </body>
    </html>
  );
}
