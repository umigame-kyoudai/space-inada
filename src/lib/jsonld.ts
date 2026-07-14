import { siteConfig, absoluteUrl, mapLink } from "./seo";
import { getPriceRange, formatPrice, type Plan } from "@/data/plans";
import type { Post } from "@/data/posts";
import type { Testimonial } from "@/data/testimonials";
import {
  aboutPortrait,
  planImage,
  postImage,
  type ImageAsset,
} from "@/data/images";

/** 代表者の安定ID。LocalBusiness / Person / Article author を同一エンティティに統合する */
const FOUNDER_ID = `${siteConfig.url}/#founder`;

/**
 * 構造化データ (JSON-LD) ビルダー。
 * Metadata API は <script> を出力できないため、ここで作ったオブジェクトを
 * components/seo/JsonLd.tsx でレンダリングする。
 */

type Json = Record<string, unknown>;

/** 全ページ共通：Google検索上のサイト名を明示する。 */
export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    alternateName: "宮古島 星空フォト キーフォト",
    inLanguage: "ja-JP",
    publisher: {
      "@id": `${siteConfig.url}/#business`,
    },
  };
}

/** 全ページ共通：事業者情報（ローカルSEO） */
export function localBusinessJsonLd(): Json {
  const range = getPriceRange();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.ogImage),
    logo: absoluteUrl("/icon.svg"),
    areaServed: siteConfig.contact.areaServed,
    address: {
      "@type": "PostalAddress",
      addressRegion: siteConfig.contact.region,
      addressLocality: siteConfig.contact.locality,
      addressCountry: "JP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    hasMap: mapLink(),
    ...(range
      ? { priceRange: `${formatPrice(range.min)}〜${formatPrice(range.max)}` }
      : {}),
    currenciesAccepted: "JPY",
    paymentAccepted: "現金",
    ...(siteConfig.contact.telephone
      ? { telephone: siteConfig.contact.telephone }
      : {}),
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(siteConfig.sameAs.length ? { sameAs: siteConfig.sameAs } : {}),
    founder: {
      "@type": "Person",
      "@id": FOUNDER_ID,
      name: siteConfig.author.name,
    },
  };
}

/** 代表者（/about の E-E-A-T） */
export function personJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: siteConfig.author.name,
    jobTitle: siteConfig.author.role,
    url: absoluteUrl("/about"),
    ...(aboutPortrait.src ? { image: absoluteUrl(aboutPortrait.src) } : {}),
    worksFor: {
      "@id": `${siteConfig.url}/#business`,
    },
  };
}

/** プラン詳細：Service */
export function serviceJsonLd(plan: Plan): Json {
  const cover = planImage(plan);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: plan.name,
    name: plan.seo.title,
    description: plan.seo.description,
    url: absoluteUrl(`/plans/${plan.slug}`),
    ...(cover.src ? { image: absoluteUrl(cover.src) } : {}),
    areaServed: siteConfig.contact.areaServed,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${siteConfig.url}/#business`,
      name: siteConfig.name,
    },
    ...(typeof plan.priceFrom === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: plan.priceFrom,
            priceCurrency: "JPY",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(`/booking?plan=${plan.slug}`),
          },
        }
      : {}),
  };
}

/** FAQ ページ：FAQPage */
export function faqJsonLd(faqs: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

/** ブログ記事：BlogPosting */
export function articleJsonLd(post: Post): Json {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const coverImage = postImage(post);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    inLanguage: "ja-JP",
    keywords: post.keywords.join(","),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: absoluteUrl(coverImage.src ?? siteConfig.ogImage),
    author: {
      "@type": "Person",
      "@id": FOUNDER_ID,
      name: siteConfig.author.name,
      url: absoluteUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.svg"),
      },
    },
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
  };
}

/**
 * お客様の声：LocalBusiness に紐づく Review + AggregateRating。
 * ⚠️ rating は実際にいただいた本物の評価のみを渡すこと（架空評価はポリシー違反）。
 */
export function reviewsJsonLd(
  testimonials: Testimonial[],
  averageRating: number,
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: testimonials.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      datePublished: t.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: t.body,
    })),
  };
}

/** 撮影の様子などの動画：VideoObject */
export function videoJsonLd(opts: {
  name: string;
  description: string;
  contentPath: string;
  uploadDate: string;
  thumbnailPath?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    contentUrl: absoluteUrl(opts.contentPath),
    thumbnailUrl: absoluteUrl(opts.thumbnailPath ?? siteConfig.ogImage),
    uploadDate: opts.uploadDate,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/** 手順系記事：HowTo */
export function howToJsonLd(post: Post): Json | null {
  if (!post.howTo) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.howTo.name,
    step: post.howTo.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** 撮影ギャラリー：ImageGallery（画像検索・ライセンス表示の補強） */
export function imageGalleryJsonLd(images: ImageAsset[]): Json {
  // Search Console「画像メタデータ」の推奨4項目（creator / copyrightNotice /
  // license / acquireLicensePage）。ライセンス先はギャラリー内の説明セクション。
  const licensePage = absoluteUrl("/gallery#image-license");

  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `撮影ギャラリー｜${siteConfig.name}`,
    url: absoluteUrl("/gallery"),
    inLanguage: "ja-JP",
    publisher: {
      "@id": `${siteConfig.url}/#business`,
    },
    image: images.flatMap((img) =>
      img.src
        ? [
            {
              "@type": "ImageObject",
              contentUrl: absoluteUrl(img.src),
              caption: img.alt,
              creditText: siteConfig.name,
              creator: {
                "@type": "Person",
                "@id": FOUNDER_ID,
                name: siteConfig.author.name,
              },
              copyrightNotice: `© ${siteConfig.name}`,
              license: licensePage,
              acquireLicensePage: licensePage,
            },
          ]
        : [],
    ),
  };
}

/** パンくず：BreadcrumbList */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
