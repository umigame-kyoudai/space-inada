import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ImageSlot } from "@/components/media/ImageSlot";
import { getPosts } from "@/data/posts";
import { postImage } from "@/data/images";

export const metadata: Metadata = buildMetadata({
  title: "星空フォトコラム",
  description:
    "宮古島の星空・天の川・プロポーズ撮影・夜観光に関するコラム。撮影に役立つ時期や時間帯、楽しみ方をプロが解説します。",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getPosts();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "星空フォトコラム",
    url: absoluteUrl("/blog"),
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      image: absoluteUrl(postImage(p).src ?? "/og/og-default.jpg"),
    })),
  };

  return (
    <Section>
      <JsonLd data={blogJsonLd} />
      <Breadcrumbs items={[{ name: "コラム", path: "/blog" }]} />

      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">星空フォトコラム</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        宮古島で星空を楽しむ・撮るための知識を発信。見頃の時期や天の川、プロポーズ撮影、夜観光まで、撮影のプロがお届けします。
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="cosmic-panel cosmic-panel-hover group flex flex-col overflow-hidden rounded-lg"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <ImageSlot
                asset={postImage(post)}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <time className="text-xs text-zinc-500">{post.publishedAt}</time>
              <h2 className="mt-2 text-lg font-bold text-white group-hover:text-teal-100">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
