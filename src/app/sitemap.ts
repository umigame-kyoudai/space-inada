import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { getPlans } from "@/data/plans";
import { getPosts } from "@/data/posts";
import {
  aboutPortrait,
  galleryImages,
  planImages,
  postImage,
} from "@/data/images";
import { assertDataIntegrity } from "@/lib/data-integrity";

/**
 * 全URLを動的生成。プラン・記事はデータから自動列挙されるため、
 * ページ追加時に sitemap への手作業は不要。
 *
 * ここはビルド時に必ず実行されるため、データ品質チェックも併せて行う
 * （不整合があればビルドを失敗させる）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  assertDataIntegrity();

  const base = siteConfig.url;
  const plans = getPlans();
  const posts = getPosts();
  // 静的ページの最終更新日。サイト全体に関わる変更（デザイン・文言・機能）を入れたら更新する
  const siteUpdatedAt = new Date("2026-07-07");
  const planUpdatedAt = new Date(
    Math.max(...plans.map((plan) => new Date(plan.updatedAt).getTime())),
  );
  const blogUpdatedAt = new Date(
    Math.max(...posts.map((post) => new Date(post.updatedAt).getTime())),
  );
  const imageUrl = (path: string) => `${base}${path}`;
  const galleryImageUrls = galleryImages.flatMap((image) =>
    image.src ? [imageUrl(image.src)] : [],
  );
  const planImageUrls = plans.flatMap((plan) =>
    planImages(plan).flatMap((image) =>
      image.src ? [imageUrl(image.src)] : [],
    ),
  );
  const postImageUrls = posts.flatMap((post) => {
    const image = postImage(post);
    return image.src ? [imageUrl(image.src)] : [];
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: siteUpdatedAt,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        imageUrl("/images/hero/hero-star-desktop.jpg"),
        ...galleryImageUrls.slice(0, 6),
      ],
    },
    {
      url: `${base}/plans`,
      lastModified: planUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.9,
      images: planImageUrls,
    },
    {
      url: `${base}/booking`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/gallery`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
      images: galleryImageUrls,
    },
    {
      url: `${base}/voice`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: siteUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.6,
      images: aboutPortrait.src ? [imageUrl(aboutPortrait.src)] : undefined,
    },
    {
      url: `${base}/faq`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/access`,
      lastModified: siteUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy`,
      lastModified: siteUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/legal`,
      lastModified: siteUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/blog`,
      lastModified: blogUpdatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
      images: postImageUrls,
    },
  ];

  const planPages: MetadataRoute.Sitemap = plans.map((p) => ({
    url: `${base}/plans/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly",
    // 近日公開プランは内容が薄いため、公開済みプランよりクロール優先度を下げる
    priority: p.comingSoon ? 0.5 : 0.8,
    images: planImages(p).flatMap((image) =>
      image.src ? [imageUrl(image.src)] : [],
    ),
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => {
    const image = postImage(post);
    return {
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
      images: image.src ? [imageUrl(image.src)] : undefined,
    };
  });

  return [...staticPages, ...planPages, ...postPages];
}
