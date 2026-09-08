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
          sizes="(max-width: 767px) 76vw, 312px"
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
        <p className="plan-card-audience">{overlay.forWhom.join(" · ")}</p>
        <h3 className="plan-card-title">{overlay.name}</h3>
        <div className="plan-card-price">
          <p className="plan-card-amount">{priceLabel}</p>
        </div>
        <dl className="plan-card-meta">
          <div>
            <dt>{dict.planDetail.durationLabel}</dt>
            <dd>{durationLabel}</dd>
          </div>
          <div>
            <dt>{dict.planDetail.deliveryLabel}</dt>
            <dd>{plan.deliveryCount}</dd>
          </div>
        </dl>
        <span className="plan-card-link">
          {dict.plansList.viewDetail}
          <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}
