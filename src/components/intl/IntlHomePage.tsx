import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/media/ImageSlot";
import { IntlPlanCard } from "./IntlPlanCard";
import { PlanCarousel } from "@/components/sections/PlanCarousel";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getPlans } from "@/data/plans";
import { heroImage, galleryImages } from "@/data/images";
import styles from "@/components/sections/Hero.module.css";

export function IntlHomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const plans = getPlans();

  return (
    <>
      {/* Hero */}
      <section
        id="home-hero"
        className={styles.hero}
        aria-labelledby="hero-title"
      >
        <div className={styles.copy}>
          <div className={styles.headline}>
            <p className="eyebrow">{dict.home.heroKicker}</p>
            <h1
              id="hero-title"
              className={`${styles.title} ${styles.translatedTitle}`}
            >
              {dict.home.heroTitle}
            </h1>
          </div>
          <div className={styles.details}>
            <p
              className={`${styles.description} ${styles.translatedDescription}`}
            >
              {dict.home.heroSubtitle}
            </p>
            <div className={styles.actions}>
              <Button
                href={`/${locale}/booking`}
                gaEvent="reservation_click"
                gaButton="hero"
              >
                {dict.home.heroCta}
              </Button>
              <Button href={`/${locale}/plans`} variant="outline">
                {dict.home.heroSecondaryCta}
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.photos}>
          <figure className={styles.mainPhoto}>
            <ImageSlot
              asset={heroImage}
              priority
              sizes="(max-width: 767px) 100vw, 60vw"
            />
            <figcaption className={styles.photoCaption}>
              <span>A night to remember.</span>
              <span>KEY PHOTO / MIYAKOJIMA</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* プラン紹介 */}
      <Section className="cosmic-band">
        <div className="flex items-end justify-between gap-4">
          <h2 className="cosmic-title text-2xl sm:text-3xl">
            {dict.home.plansTitle}
          </h2>
          <Link
            href={`/${locale}/plans`}
            className="cosmic-link shrink-0 text-sm font-semibold underline underline-offset-4"
          >
            {dict.home.plansViewAll} →
          </Link>
        </div>
        <PlanCarousel label={dict.home.plansTitle} locale={locale}>
          {plans.map((plan) => (
            <IntlPlanCard
              key={plan.slug}
              plan={plan}
              locale={locale}
              dict={dict}
            />
          ))}
        </PlanCarousel>
      </Section>

      {/* 選ばれる理由 */}
      <Section>
        <h2 className="cosmic-title text-center text-2xl sm:text-3xl">
          {dict.home.whyTitle}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {dict.home.why.map((f) => (
            <div key={f.title} className="cosmic-panel rounded-2xl p-6">
              <h3 className="text-lg font-bold text-accent">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 流れ */}
      <Section className="cosmic-band">
        <div className="text-center">
          <h2 className="cosmic-title mt-3 text-2xl sm:text-3xl">
            {dict.home.flowTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {dict.home.flowSubtitle}
          </p>
        </div>
        <div className="mt-12 space-y-5">
          {dict.home.flow.map((item, i) => (
            <article
              key={item.title}
              className={`cosmic-panel grid gap-4 rounded-2xl p-5 sm:w-[76%] sm:grid-cols-[5rem_1fr] sm:p-6 ${
                i % 2 === 0 ? "sm:mr-auto" : "sm:ml-auto"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-mist text-sm font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ギャラリー */}
      <Section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="cosmic-title text-2xl sm:text-3xl">
            {dict.home.galleryTitle}
          </h2>
          <Link
            href="/gallery"
            className="cosmic-link shrink-0 text-sm font-semibold underline underline-offset-4"
          >
            {dict.home.galleryViewAll} →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {galleryImages.slice(0, 6).map((image, i) => (
            <div
              key={i}
              className="cosmic-panel relative aspect-square overflow-hidden rounded-xl"
            >
              <ImageSlot asset={image} sizes="(max-width: 640px) 50vw, 33vw" />
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="cosmic-panel rounded-2xl p-8 text-center sm:p-12">
          <h2 className="cosmic-title text-2xl sm:text-3xl">
            {dict.home.ctaHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            {dict.home.ctaText}
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              href={`/${locale}/booking`}
              gaEvent="reservation_click"
              gaButton="home_cta"
            >
              {dict.home.ctaButton}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
