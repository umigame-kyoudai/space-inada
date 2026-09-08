import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { IntlPlanCard } from "./IntlPlanCard";
import { PlanCarousel } from "@/components/sections/PlanCarousel";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getPlans } from "@/data/plans";

export function IntlPlansListPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const plans = getPlans();
  const optionOverlays = [
    dict.planOptionOverlay.pickup,
    dict.planOptionOverlay.nomination,
    dict.planOptionOverlay.lateNight,
    dict.planOptionOverlay.location,
  ];

  return (
    <Section className="plans-page">
      <h1 className="cosmic-title mt-5 text-2xl sm:text-4xl">
        {dict.plansList.title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        {dict.plansList.lead}
      </p>
      <p className="mt-3 max-w-2xl text-sm font-medium text-accent">
        {dict.plansList.deliveryNote}
      </p>

      <PlanCarousel label={dict.plansList.title} locale={locale}>
        {plans.map((plan) => (
          <IntlPlanCard
            key={plan.slug}
            plan={plan}
            locale={locale}
            dict={dict}
          />
        ))}
      </PlanCarousel>

      <h2 className="mt-20 text-2xl font-bold text-accent">
        {dict.plansList.optionsTitle}
      </h2>
      <p className="mt-3 text-sm text-muted">{dict.plansList.optionsLead}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {optionOverlays.map((opt) => (
          <div key={opt.name} className="cosmic-panel rounded-lg p-6">
            <h3 className="text-lg font-bold text-ink">{opt.name}</h3>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {opt.detail.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-20 flex justify-center">
        <Button
          href={`/${locale}/booking`}
          gaEvent="reservation_click"
          gaButton="plans_list"
        >
          {dict.plansList.ctaHeading}
        </Button>
      </div>
    </Section>
  );
}
