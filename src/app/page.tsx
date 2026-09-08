import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, siteConfig } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { PlanCard } from "@/components/sections/PlanCard";
import { PlanCarousel } from "@/components/sections/PlanCarousel";
import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { Hero } from "@/components/sections/Hero";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { ImageSlot } from "@/components/media/ImageSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { videoJsonLd } from "@/lib/jsonld";
import { galleryImages, shootingVideo } from "@/data/images";
import { DELIVERY_TIME_LABEL, getBookablePlans } from "@/data/plans";
import { getPosts } from "@/data/posts";
import { getTestimonials } from "@/data/testimonials";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata({
  title: { absolute: `宮古島の星空フォト・記念日撮影｜${siteConfig.name}` },
  description: siteConfig.description,
  path: "/",
  languages: hreflangAlternates("home"),
});

const features = [
  {
    title: "星空も、表情も美しく。",
    text: "星空と人物を両立する専用ライティング。ポーズもご案内するので、撮影がはじめてでも安心です。",
  },
  {
    title: "その夜、いちばんの場所へ。",
    text: "月齢や雲、風の様子を見ながら、当日の星空に合わせて宮古島内の撮影スポットをご案内します。",
  },
  {
    title: "旅の余韻が残るうちに。",
    text: `${DELIVERY_TIME_LABEL}にオンラインで納品。大切な人と、旅の思い出をすぐに共有できます。`,
  },
];
const journey = [
  {
    title: "予約・ご相談",
    text: "ご希望の日程・人数・プランをフォームに入力し、公式LINEからご相談ください。",
  },
  {
    title: "集合場所のご案内",
    text: "天候と月齢を確認し、撮影に合う時間とスポットをご案内します。",
  },
  {
    title: "星空の下で撮影",
    text: "星を眺めながら、リラックスして。構図やポーズはお任せください。",
  },
  {
    title: "写真をお届け",
    text: `${DELIVERY_TIME_LABEL}にデータをお届け。あの夜が、いつでも見返せる一枚に。`,
  },
];

export default function Home() {
  const plans = getBookablePlans();
  const posts = getPosts().slice(0, 3);
  const testimonials = getTestimonials().slice(0, 3);
  return (
    <>
      <Hero />
      <div className={styles.serviceStrip}>
        <Container className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 py-5">
          <span>宮古島の星空を知るフォトグラファー</span>
          <span>カップル・家族・記念日の撮影</span>
          <span>{DELIVERY_TIME_LABEL}に納品</span>
        </Container>
      </div>

      <Section id="plans" className={`cosmic-band ${styles.homePlans}`}>
        <SectionHeading
          eyebrow="PHOTO PLANS"
          title="撮影プラン"
          href="/plans"
          linkLabel="一覧・料金比較"
        />
        <p className="mt-3 text-xs leading-6 text-muted">
          大切な人や、旅のスタイルに合わせて。
        </p>
        <PlanCarousel label="おすすめの撮影プラン">
          {plans.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} />
          ))}
        </PlanCarousel>
        <p className="mt-4 text-xs leading-6 text-muted">
          全プラン、{DELIVERY_TIME_LABEL}にオンライン納品。
        </p>
      </Section>

      <Section id="experience">
        <div className={styles.introduction}>
          <div>
            <p className="eyebrow mb-4">BEYOND THE DAYLIGHT</p>
            <h2 className="cosmic-title text-2xl sm:text-3xl">
              宮古島の魅力は、
              <br />
              日が沈んでからも。
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-8 text-muted">
            青い海を楽しんだ、その日の夜。
            <br />
            街明かりから少し離れると、満天の星が待っています。
            <br />
            ふたりで見上げた空も、家族で笑った時間も。
            <br />
            KEY PHOTOが、宮古島の夜を思い出の一枚に残します。
          </p>
        </div>
      </Section>

      <Section id="gallery">
        <SectionHeading
          eyebrow="MEMORIES UNDER THE STARS"
          title="この星空の下で、生まれた思い出。"
          href="/gallery"
          linkLabel="ギャラリーを見る"
        />
        <div className={styles.gallery}>
          {galleryImages.slice(0, 4).map((asset, i) => (
            <Link
              href="/gallery"
              key={asset.src ?? i}
              className={styles.galleryPhoto}
              aria-label={`${asset.alt}などの撮影ギャラリーを見る`}
            >
              <ImageSlot asset={asset} sizes="(max-width: 767px) 50vw, 40vw" />
              <span aria-hidden="true" className={styles.galleryArrow}>
                ↗
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-right text-[10px] tracking-wide text-muted">
          KEY PHOTOが宮古島で撮影した、実際のお写真です。
        </p>
      </Section>

      <Section className="cosmic-band">
        <div className={styles.movie}>
          <div>
            <p className="eyebrow">THE EXPERIENCE</p>
            <h2 className="cosmic-title mt-4 text-2xl sm:text-3xl">
              写真を撮る時間も、
              <br />
              旅の思い出に。
            </h2>
            <p className="mt-5 max-w-sm text-xs leading-7 text-muted">
              夜風を感じながら、星を探して、少し笑って。はじめての星空撮影の雰囲気を、動画でご覧ください。
            </p>
            <Link href="/about" className="section-heading-link mt-5">
              私たちについて<span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="overflow-hidden rounded-md bg-night">
            <VideoPlayer video={shootingVideo} />
          </div>
        </div>
        {shootingVideo.src && (
          <JsonLd
            data={videoJsonLd({
              name: "宮古島 星空フォト撮影の様子",
              description:
                "宮古島の満天の星空のもとで行う星空フォト撮影の様子。",
              contentPath: shootingVideo.src,
              uploadDate: "2026-06-06",
            })}
          />
        )}
        <div className={styles.features}>
          {features.map((feature) => (
            <article key={feature.title}>
              <h3 className="font-serif text-lg font-medium text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-xs leading-7 text-muted">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="HOW IT WORKS"
          title="ご予約から、写真のお届けまで。"
          href="/faq"
          linkLabel="よくある質問"
        />
        <ol className={styles.journey}>
          {journey.map((item, i) => (
            <li key={item.title}>
              <span className={styles.step}>0{i + 1}</span>
              <h3 className="mt-5 text-sm font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-xs leading-7 text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-y border-line">
        <SectionHeading
          eyebrow="JOURNAL"
          title="宮古島の夜を、もっと楽しむ。"
          href="/blog"
          linkLabel="コラムを読む"
        />
        <div className={styles.journal}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={styles.journalEntry}
            >
              <h3 className="text-sm font-medium leading-7 text-ink">
                {post.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted">
                {post.excerpt}
              </p>
              <span className="mt-auto pt-6 text-xs text-accent">
                記事を読む <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {testimonials.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="GUEST STORIES"
            title="お客様の声"
            href="/voice"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {testimonials.map((item) => (
              <TestimonialCard
                key={`${item.name}-${item.date}`}
                testimonial={item}
              />
            ))}
          </div>
        </Section>
      )}
      <Section>
        <CtaBooking />
      </Section>
    </>
  );
}
