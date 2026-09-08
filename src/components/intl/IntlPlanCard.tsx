import Link from "next/link";
import type { Plan } from "@/data/plans";
import { planImages } from "@/data/images";
import { ImageSlot } from "@/components/media/ImageSlot";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { formatTemplate } from "@/lib/i18n/format";

export function IntlPlanCard({
  plan,
  locale,
  dict,
}: {
  plan: Plan;
  locale: Locale;
  dict: Dictionary;
}) {
  const overlay = dict.planOverlay[plan.slug];
  const priceLabel = plan.comingSoon
    ? dict.common.comingSoon
    : typeof plan.priceFrom === "number"
      ? `${dict.common.yen}${plan.priceFrom.toLocaleString("en-US")}${plan.priceUnit === "/組" ? dict.common.perGroup : dict.common.perPerson}〜`
      : dict.common.consultRequired;
  const durationLabel = plan.durationMin
    ? formatTemplate(dict.common.minutesApprox, { min: plan.durationMin })
    : dict.common.consultRequired;
  return (
    <Link
      href={`/${locale}/plans/${plan.slug}`}
      data-ga-event="plan_click"
      data-ga-button="plan_card"
      data-ga-plan={plan.name}
      className="plan-card cosmic-panel cosmic-panel-hover group"
    >
      <div className="plan-card-image">
        <ImageSlot
          asset={planImages(plan)[0]}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
        />
        {overlay.badge && (
          <span className="plan-card-badge">{overlay.badge}</span>
        )}
        {plan.comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-night/55 text-xs tracking-widest text-on-photo">
            {dict.common.comingSoon}
          </div>
        )}
      </div>
      <div className="plan-card-content">
        <p className="text-[10px] leading-6 text-muted">
          {overlay.forWhom.join(" · ")}
        </p>
        <h3 className="mt-2 font-serif text-xl font-medium leading-relaxed text-ink">
          {overlay.name}
        </h3>
        <p className="mt-2 text-xs leading-6 text-muted">{overlay.tagline}</p>
        <div className="plan-card-price">
          <p className="text-xl font-medium text-ink">{priceLabel}</p>
          {typeof plan.priceFrom === "number" && (
            <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-muted">
              {overlay.pricingDetail.slice(0, 3).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
        <dl className="my-5 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[10px] text-muted">
              {dict.planDetail.durationLabel}
            </dt>
            <dd className="mt-2 text-ink">{durationLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted">
              {dict.planDetail.deliveryLabel}
            </dt>
            <dd className="mt-2 text-ink">{plan.deliveryCount}</dd>
          </div>
        </dl>
        <span className="mt-auto flex items-center justify-between border-t border-line pt-4 text-xs text-accent">
          {dict.plansList.viewDetail}
          <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}
