import type { Metadata } from "next";

/**
 * SEO設定の単一の真実 (Single Source of Truth)。
 *
 * - サイト共通の定数を `siteConfig` に集約
 * - 各ページは `buildMetadata()` に差分だけ渡せば、canonical / OG / Twitter が自動補完される
 *
 * TODO(運用): 本番ドメイン・NAP（住所/電話/営業時間）・SNS は確定値に置き換える。
 *   ドメインは環境変数 NEXT_PUBLIC_SITE_URL で上書き可能。
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://space-inada.com"
).replace(/\/$/, "");

export const siteConfig = {
  name: "KEY PHOTO 宮古島",
  /** title.template に使う短い屋号 */
  shortName: "KEY PHOTO",
  url: SITE_URL,
  description:
    "宮古島の満天の星空・天の川を背景に、カップル・記念日・家族・プロポーズの一枚を撮影。星空フォトのプロが、宮古島でしか撮れない夜の思い出を残します。",
  locale: "ja_JP",
  /** 代表者・E-E-A-T 用 */
  author: {
    name: "稲田圭市",
    role: "代表 / フォトグラファー",
  },
  /** NAP（ローカルSEOの要）。住所・SNS は確定後に置き換える */
  contact: {
    areaServed: "沖縄県宮古島市",
    region: "沖縄県",
    locality: "宮古島市",
    telephone: "090-9279-9586",
    email: "miyako.keyphoto@gmail.com",
  },
  /** 位置情報（ローカルSEO）。宮古島の中心付近。集合場所は予約後案内のため一般的な座標 */
  geo: {
    latitude: 24.8055,
    longitude: 125.2811,
  },
  /** 営業時間（星空撮影は夜間・完全予約制）。確定後に調整 */
  hours: {
    opens: "18:00",
    closes: "23:00",
    description: "完全予約制（星空撮影のため夜間に営業）",
  },
  /** 地図。NEXT_PUBLIC_MAP_EMBED_URL で埋め込みURLを上書き可。未設定なら対応エリア(宮古島市)を表示 */
  map: {
    query: "宮古島市",
    embedUrl: process.env.NEXT_PUBLIC_MAP_EMBED_URL ?? "",
  },
  /** SNS（sameAs 用）。ナレッジグラフ強化のため公式アカウントを列挙 */
  sameAs: ["https://www.instagram.com/_key_photo"] as string[],
  /** 既定 OG 画像（buildMetadata の各ページOG・JSON-LD 用の安定パス）。
      トップは app/opengraph-image.jpg がファイル規約で自動付与する */
  ogImage: "/og/og-default.jpg",
  /** 既定 OG 画像の代替テキスト（og:image:alt / twitter:image:alt） */
  ogImageAlt: "宮古島の満天の星空と天の川｜KEY PHOTO 宮古島",
  twitter: {
    card: "summary_large_image" as const,
    site: "", // TODO: @アカウント
  },
} as const;

type BuildMetadataInput = {
  /** ページ固有タイトル（title.template により " | 星空フォト宮古島" が付与される）。トップは absolute 指定で渡す */
  title?: string | { absolute: string };
  description?: string;
  /** ルート相対パス（"/plans" など）。canonical / og:url の算出に使う */
  path: string;
  /** OG 画像を差し替える場合のルート相対 or 絶対URL（alt 付きも可） */
  images?: (string | { url: string; alt: string })[];
  /** 検索結果に出したくないページは true */
  noindex?: boolean;
  /** og:type（記事は "article"） */
  type?: "website" | "article";
  /** type: "article" のとき OG に article:published_time / modified_time / author / tag を出す */
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    tags?: string[];
  };
  /** このルート自身の opengraph-image.tsx を使う場合 true（既定のルートOGを付与しない） */
  ownOgImage?: boolean;
};

/**
 * ページ用 Metadata を生成する。各ページは差分だけ渡せばよい。
 * metadataBase は root layout 側で設定するため、ここでは相対パスでOK。
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  images,
  noindex,
  type = "website",
  article,
  ownOgImage = false,
}: BuildMetadataInput): Metadata {
  const canonical = path;
  // 画像の決定ルール：
  //  1. images を明示 → それを使う
  //  2. ownOgImage（このルートに opengraph-image.tsx がある）→ 何も指定せずファイル規約に委ねる
  //  3. それ以外 → ブランド既定のルートOG画像を付与（ルートOGは子ルートに継承されないため明示する）
  const imageOverride = images
    ? { images }
    : ownOgImage
      ? {}
      : {
          images: [{ url: siteConfig.ogImage, alt: siteConfig.ogImageAlt }],
        };

  return {
    title,
    description,
    alternates: {
      canonical,
      // 全ページの <head> からフィードを発見できるようにする（クローラ・RSSリーダー向け）
      types: { "application/rss+xml": "/feed.xml" },
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      url: canonical,
      siteName: siteConfig.name,
      title: typeof title === "string" ? title : title?.absolute,
      description,
      locale: siteConfig.locale,
      ...(type === "article" && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime ?? article.publishedTime,
            authors: [siteConfig.author.name],
            ...(article.tags?.length ? { tags: article.tags } : {}),
          }
        : {}),
      ...imageOverride,
    },
    twitter: {
      card: siteConfig.twitter.card,
      title: typeof title === "string" ? title : title?.absolute,
      description,
      ...imageOverride,
    },
  };
}

/** 絶対URLを作る（JSON-LD など metadataBase が効かない箇所用） */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Googleマップの埋め込み（iframe src）URL */
export function mapEmbedUrl(): string {
  if (siteConfig.map.embedUrl) return siteConfig.map.embedUrl;
  return `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.map.query)}&z=11&output=embed`;
}

/** Googleマップを新規タブで開くURL（hasMap / リンク用） */
export function mapLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.map.query)}`;
}
