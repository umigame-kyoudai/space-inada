import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PlanGallery } from "@/components/sections/PlanGallery";
import { planImages } from "@/data/images";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { formatTemplate } from "@/lib/i18n/format";
import { getPlans, type Plan } from "@/data/plans";

export function IntlPlanDetailPage({ locale, plan }: { locale: Locale; plan: Plan }) {
  const dict = getDictionary(locale);
  const overlay = dict.planOverlay[plan.slug];
  const priceLabel = plan.comingSoon
    ? dict.common.comingSoon
    : typeof plan.priceFrom === "number"
      ? `${dict.common.yen}${plan.priceFrom.toLocaleString("en-US")}${plan.priceUnit === "/組" ? dict.common.perGroup : dict.common.perPerson}〜`
      : dict.common.consultRequired;

  return (
    <Section>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {overlay.badge && (
          <span className="rounded-md border border-amber-200/70 bg-amber-300 px-3 py-1 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-300/15">
            {overlay.badge}
          </span>
        )}
        {overlay.forWhom.map((w) => (
          <span key={w} className="rounded-md border border-teal-200/15 bg-teal-300/10 px-3 py-1 text-xs text-teal-200">
            {w}
          </span>
        ))}
      </div>

      <h1 className="cosmic-title mt-4 text-3xl font-bold sm:text-4xl">{overlay.name}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">{overlay.tagline}</p>

      <div className="mt-6">
        {plan.comingSoon ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-amber-200/25 bg-amber-300/[0.06] p-5">
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300">{dict.planDetail.comingSoonNotice}</p>
            <Button href={`/${locale}/booking`} gaEvent="reservation_click" gaButton="plan_detail">
              {dict.planDetail.comingSoonCta}
            </Button>
          </div>
        ) : (
          <Button href={`/${locale}/booking?plan=${plan.slug}`} gaEvent="reservation_click" gaButton="plan_detail" gaPlan={plan.name}>
            {dict.planDetail.bookThisPlan}
          </Button>
        )}
      </div>

      <PlanGallery images={planImages(plan)} priority />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="cosmic-panel rounded-xl p-5">
          <dt className="text-xs text-zinc-500">{dict.planDetail.priceLabel}</dt>
          <dd className="mt-1">
            <p className="text-xl font-bold text-white">{priceLabel}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-zinc-400">
              {overlay.pricingDetail.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="cosmic-panel rounded-xl p-5">
          <dt className="text-xs text-zinc-500">{dict.planDetail.durationLabel}</dt>
          <dd className="mt-1 text-xl font-bold text-white">
            {plan.durationMin
              ? formatTemplate(dict.common.minutesApprox, { min: plan.durationMin })
              : dict.common.consultRequired}
          </dd>
        </div>
        <div className="cosmic-panel rounded-xl p-5">
          <dt className="text-xs text-zinc-500">{dict.planDetail.deliveryLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-white">{plan.deliveryCount}</dd>
        </div>
      </dl>

      <h2 className="mt-14 text-2xl font-bold text-teal-100">{dict.planDetail.includedTitle}</h2>
      <ul className="mt-6 space-y-3">
        {overlay.features.map((f) => (
          <li key={f} className="flex gap-3 text-zinc-300">
            <span aria-hidden className="text-amber-300">
              ✦
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-xl font-bold text-teal-100">{dict.planDetail.otherPlansTitle}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {getPlans()
          .filter((p) => p.slug !== plan.slug)
          .map((p) => (
            <Link
              key={p.slug}
              href={`/${locale}/plans/${p.slug}`}
              data-ga-event="plan_click"
              data-ga-button="plan_detail_related"
              data-ga-plan={p.name}
              className="rounded-lg border border-teal-200/15 bg-slate-950/40 px-4 py-2 text-sm text-zinc-300 hover:border-amber-200/60 hover:text-amber-100"
            >
              {dict.planOverlay[p.slug].name}
            </Link>
          ))}
      </div>

      <div className="mt-20 rounded-2xl border border-amber-200/25 bg-amber-300/5 p-8 text-center sm:p-10">
        <h2 className="cosmic-title text-xl font-bold sm:text-2xl">
          {plan.comingSoon ? dict.planDetail.ctaHeadingComingSoon : dict.planDetail.ctaHeadingDefault}
        </h2>
        <div className="mt-6 flex justify-center">
          <Button
            href={plan.comingSoon ? `/${locale}/booking` : `/${locale}/booking?plan=${plan.slug}`}
            gaEvent="reservation_click"
            gaButton="plan_detail_cta"
            gaPlan={plan.name}
          >
            {plan.comingSoon ? dict.planDetail.comingSoonCta : dict.planDetail.bookThisPlan}
          </Button>
        </div>
      </div>
    </Section>
  );
}
