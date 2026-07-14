import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, siteConfig } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { PlanCard } from "@/components/sections/PlanCard";
import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { Hero } from "@/components/sections/Hero";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { GalleryMasonry } from "@/components/sections/GalleryMasonry";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { JsonLd } from "@/components/seo/JsonLd";
import { videoJsonLd } from "@/lib/jsonld";
import { galleryImages, shootingVideo } from "@/data/images";
import { DELIVERY_TIME_LABEL, getPlans } from "@/data/plans";
import { getPosts } from "@/data/posts";
import { getTestimonials } from "@/data/testimonials";

export const metadata: Metadata = buildMetadata({
  title: { absolute: `宮古島の星空フォト・記念日撮影｜${siteConfig.name}` },
  description: siteConfig.description,
  path: "/",
});

const features = [
  {
    title: "宮古島だからこそ撮れる星空",
    text: "光害が少なく空気の澄んだ宮古島は、天の川まで肉眼で見える国内屈指の星空エリア。スマホでは残せない夜空を背景に撮影します。",
  },
  {
    title: "人物も星空も美しく",
    text: "星空と人物を両立する専用ライティングと構図設計。記念日・家族・カップル、それぞれの瞬間を作品として残します。",
  },
  {
    title: "天候・月齢に合わせた提案",
    text: "当日の雲の動きや月齢を読み、最も星が見えるスポットへご案内。限られた晴れ間を最大限に活かします。",
  },
];

const journey = [
  {
    step: "01",
    title: "月齢と雲を読む",
    text: "ご希望日をもとに、星が見えやすい時間帯と撮影条件を確認します。",
  },
  {
    step: "02",
    title: "夜空に合わせて場所を決める",
    text: "当日の風向き・雲量・街明かりを見ながら、宮古島内の最適なスポットへご案内します。",
  },
  {
    step: "03",
    title: "星空と人物を一緒に残す",
    text: "専用ライティングで、星空の奥行きと表情のどちらも美しく写します。",
  },
  {
    step: "04",
    title: "旅の余韻ごと納品",
    text: `${DELIVERY_TIME_LABEL}にオンラインでデータをお渡し。旅行中から、宮古島の夜を何度でも見返せます。`,
  },
];

export default function Home() {
  const plans = getPlans();
  const posts = getPosts().slice(0, 3);
  const testimonials = getTestimonials().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <Hero />

      {/* 撮影の様子（動画） */}
      <Section className="cosmic-band">
        {shootingVideo.src && (
          <JsonLd
            data={videoJsonLd({
              name: "宮古島 星空フォト撮影の様子",
              description:
                "宮古島の満天の星空のもとで行う星空フォト撮影の様子。プロのフォトグラファーが記念日・カップル・家族の一枚を撮影します。",
              contentPath: shootingVideo.src,
              uploadDate: "2026-06-06",
            })}
          />
        )}
        <div className="reveal-up text-center">
          <p className="cosmic-kicker text-sm font-semibold tracking-widest">MOVIE</p>
          <h2 className="cosmic-title mt-3 text-2xl font-bold sm:text-3xl">撮影の様子</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            宮古島の星空のもとで、どんなふうに撮影が進むのか。
            当日の雰囲気を動画でご覧ください。
          </p>
        </div>
        <div className="cosmic-panel reveal-up delay-100 mt-8 overflow-hidden rounded-lg bg-black">
          <VideoPlayer video={shootingVideo} />
        </div>
      </Section>

      {/* 選ばれる理由 */}
      <Section>
        <h2 className="cosmic-title reveal-up text-center text-2xl font-bold sm:text-3xl">
          宮古島の星空フォトが選ばれる理由
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`cosmic-panel reveal-up rounded-lg p-6 ${i === 1 ? "delay-100" : i === 2 ? "delay-200" : ""}`}
            >
              <h3 className="text-lg font-bold text-teal-100">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 予約から納品まで */}
      <Section className="cosmic-band">
        <div className="reveal-up text-center">
          <p className="cosmic-kicker text-sm font-semibold tracking-widest">FLOW</p>
          <h2 className="cosmic-title mt-3 text-2xl font-bold sm:text-3xl">
            宮古島の夜へ向かう流れ
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            ご予約から撮影、納品まで。夜空のコンディションに合わせて進めるため、
            はじめての方でも安心してお越しいただけます。
          </p>
        </div>

        <div className="mission-line mt-12 space-y-5">
          {journey.map((item, i) => (
            <article
              key={item.step}
              className={`cosmic-panel reveal-up grid gap-4 rounded-lg p-5 sm:w-[76%] sm:grid-cols-[5rem_1fr] sm:p-6 ${
                i % 2 === 0 ? "sm:mr-auto" : "sm:ml-auto"
              } ${i === 1 ? "delay-100" : i === 2 ? "delay-200" : i === 3 ? "delay-300" : ""}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200/50 bg-amber-300/10 text-sm font-bold text-amber-200">
                {item.step}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* プラン紹介 */}
      <Section className="cosmic-band">
        <SectionHeading title="撮影プラン" href="/plans" />
        <div
          aria-label="撮影プラン一覧"
          className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {plans.map((plan, i) => (
            <div
              key={plan.slug}
              className={`reveal-up w-[78%] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink ${i % 3 === 1 ? "delay-100" : i % 3 === 2 ? "delay-200" : ""}`}
            >
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </Section>

      {/* ギャラリー抜粋 */}
      <Section>
        <SectionHeading title="撮影ギャラリー" href="/gallery" reveal />
        <GalleryMasonry
          images={galleryImages.slice(0, 6)}
          className="mt-10"
          reveal
        />
      </Section>

      {/* コラム */}
      <Section>
        <SectionHeading title="星空フォトコラム" href="/blog" reveal />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`cosmic-panel cosmic-panel-hover reveal-up group rounded-lg p-6 ${i === 1 ? "delay-100" : i === 2 ? "delay-200" : ""}`}
            >
              <h3 className="text-base font-bold text-white group-hover:text-teal-100">
                {post.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* お客様の声（実際の声が1件以上あるときだけ表示。data/testimonials.ts に追加すると自動で有効化） */}
      {testimonials.length > 0 && (
        <Section className="cosmic-band">
          <SectionHeading title="お客様の声" href="/voice" reveal />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={`${t.name}-${t.date}`}
                className={`reveal-up ${i === 1 ? "delay-100" : i === 2 ? "delay-200" : ""}`}
              >
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section>
        <div className="reveal-up">
          <CtaBooking />
        </div>
      </Section>
    </>
  );
}
