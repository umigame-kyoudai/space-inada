import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { JsonLd } from "@/components/seo/JsonLd";
import { reviewsJsonLd } from "@/lib/jsonld";
import { getTestimonials, getAverageRating } from "@/data/testimonials";

/**
 * 実際の声が0件の間は薄いページになるため noindex にして検索から除外する
 * （sitemap からも除外。data/testimonials.ts に追加すれば自動で index に戻る）。
 */
const hasTestimonials = getTestimonials().length > 0;

export const metadata: Metadata = buildMetadata({
  title: "お客様の声・口コミ",
  description:
    "宮古島の星空フォトをご利用いただいたお客様の声・口コミ。プロポーズ・記念日・家族写真など、実際の撮影体験の感想をご紹介します。",
  path: "/voice",
  noindex: !hasTestimonials,
});

/**
 * レビュー構造化データ（Review/AggregateRating）の出力フラグ。
 * ⚠️ 実体のない評価の公開はポリシー違反のため既定で OFF。
 *    本物の口コミ・評価を掲載したら NEXT_PUBLIC_ENABLE_REVIEW_SCHEMA=true で有効化する。
 */
const SHOW_REVIEW_SCHEMA =
  process.env.NEXT_PUBLIC_ENABLE_REVIEW_SCHEMA === "true";

export default function VoicePage() {
  const testimonials = getTestimonials();
  const average = getAverageRating();

  return (
    <Section>
      {SHOW_REVIEW_SCHEMA && testimonials.length > 0 && (
        <JsonLd data={reviewsJsonLd(testimonials, average)} />
      )}
      <Breadcrumbs items={[{ name: "お客様の声", path: "/voice" }]} />

      <h1 className="cosmic-title mt-6 text-3xl sm:text-4xl">
        お客様の声・口コミ
      </h1>

      {testimonials.length > 0 ? (
        <>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            宮古島の星空フォトをご利用いただいた皆さまの感想です。プロポーズや記念日、家族旅行など、それぞれの大切な瞬間をお手伝いしました。
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={`${t.name}-${t.date}`} testimonial={t} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          撮影にご参加いただいたお客様の声を、順次こちらでご紹介していきます。撮影の雰囲気は、撮影ギャラリーやInstagramでもご覧いただけます。
        </p>
      )}

      <div className="mt-20">
        <CtaBooking heading="あなたの大切な一枚も、宮古島の星空で" />
      </div>
    </Section>
  );
}
