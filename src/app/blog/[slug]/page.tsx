import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PostBody } from "@/components/sections/PostBody";
import { RelatedPlans } from "@/components/sections/RelatedPlans";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { JsonLd } from "@/components/seo/JsonLd";
import { ImageSlot } from "@/components/media/ImageSlot";
import { postImage } from "@/data/images";
import { articleJsonLd, howToJsonLd } from "@/lib/jsonld";
import { getPost, getPosts, getRelatedPosts } from "@/data/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const coverImage = postImage(post);

  return buildMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blog/${post.slug}`,
    type: "article",
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.keywords,
    },
    images: coverImage.src
      ? [{ url: coverImage.src, alt: coverImage.alt }]
      : undefined,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const relatedPosts = getRelatedPosts(slug);

  return (
    <Section>
      <JsonLd data={articleJsonLd(post)} />
      {post.howTo && <JsonLd data={howToJsonLd(post)!} />}
      <Breadcrumbs
        items={[
          { name: "コラム", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <article className="mt-6">
        <header>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <time dateTime={post.publishedAt}>公開：{post.publishedAt}</time>
            {post.updatedAt !== post.publishedAt && (
              <time dateTime={post.updatedAt}>更新：{post.updatedAt}</time>
            )}
          </div>
          <h1 className="cosmic-title mt-3 text-3xl leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{post.excerpt}</p>
        </header>

        <div className="cosmic-panel relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg">
          <ImageSlot
            asset={postImage(post)}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <hr className="cosmic-rule my-10" />

        <PostBody blocks={post.body} />

        <RelatedPlans slugs={post.relatedPlans} />
      </article>

      {relatedPosts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-accent">関連するコラム</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {relatedPosts.map((rp) => (
              <li key={rp.slug}>
                <Link
                  href={`/blog/${rp.slug}`}
                  className="cosmic-panel cosmic-panel-hover group block rounded-lg p-5"
                >
                  <h3 className="text-sm font-bold text-ink group-hover:text-accent">
                    {rp.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                    {rp.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16">
        <CtaBooking />
      </div>
    </Section>
  );
}
