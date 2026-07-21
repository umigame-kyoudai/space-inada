import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/media/ImageSlot";
import { IntlPlanCard } from "./IntlPlanCard";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getPlans } from "@/data/plans";
import { heroImage, galleryImages } from "@/data/images";

export function IntlHomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const plans = getPlans();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[78vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <ImageSlot asset={heroImage} priority sizes="100vw" className="brightness-[0.55]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03040a] via-[#03040a]/40 to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8 sm:pb-24">
          <p className="cosmic-kicker text-sm font-semibold tracking-widest">{dict.home.heroKicker}</p>
          <h1 className="cosmic-title mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            {dict.home.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            {dict.home.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/${locale}/booking`} gaEvent="reservation_click" gaButton="hero">
              {dict.home.heroCta}
            </Button>
            <Button href={`/${locale}/plans`} variant="outline">
              {dict.home.heroSecondaryCta}
            </Button>
          </div>
        </div>
      </section>

      {/* 選ばれる理由 */}
      <Section>
        <h2 className="cosmic-title text-center text-2xl font-bold sm:text-3xl">{dict.home.whyTitle}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {dict.home.why.map((f) => (
            <div key={f.title} className="cosmic-panel rounded-2xl p-6">
              <h3 className="text-lg font-bold text-teal-100">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 流れ */}
      <Section className="cosmic-band">
        <div className="text-center">
          <h2 className="cosmic-title mt-3 text-2xl font-bold sm:text-3xl">{dict.home.flowTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200/50 bg-amber-300/10 text-sm font-bold text-amber-200">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* プラン紹介 */}
      <Section className="cosmic-band">
        <div className="flex items-end justify-between gap-4">
          <h2 className="cosmic-title text-2xl font-bold sm:text-3xl">{dict.home.plansTitle}</h2>
          <Link href={`/${locale}/plans`} className="cosmic-link shrink-0 text-sm font-semibold underline underline-offset-4">
            {dict.home.plansViewAll} →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <IntlPlanCard key={plan.slug} plan={plan} locale={locale} dict={dict} />
          ))}
        </div>
      </Section>

      {/* ギャラリー */}
      <Section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="cosmic-title text-2xl font-bold sm:text-3xl">{dict.home.galleryTitle}</h2>
          <Link href="/gallery" className="cosmic-link shrink-0 text-sm font-semibold underline underline-offset-4">
            {dict.home.galleryViewAll} →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {galleryImages.slice(0, 6).map((image, i) => (
            <div key={i} className="cosmic-panel relative aspect-square overflow-hidden rounded-xl">
              <ImageSlot asset={image} sizes="(max-width: 640px) 50vw, 33vw" />
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="cosmic-panel rounded-2xl p-8 text-center sm:p-12">
          <h2 className="cosmic-title text-2xl font-bold sm:text-3xl">{dict.home.ctaHeading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">{dict.home.ctaText}</p>
          <div className="mt-8 flex justify-center">
            <Button href={`/${locale}/booking`} gaEvent="reservation_click" gaButton="home_cta">
              {dict.home.ctaButton}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
