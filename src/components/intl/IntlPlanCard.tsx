import Link from "next/link";
import type { Plan } from "@/data/plans";
import { planImages } from "@/data/images";
import { ImageSlot } from "@/components/media/ImageSlot";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { formatTemplate } from "@/lib/i18n/format";

/** /plans, / のプラン一覧カード（翻訳ページ用）。PlanCard の英語・韓国語・中国語版。 */
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
  const images = planImages(plan);
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
      className="cosmic-panel cosmic-panel-hover group flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="cosmic-photo-stage relative aspect-[16/9] w-full overflow-hidden sm:aspect-[16/10]">
        <ImageSlot
          asset={images[0]}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/80 to-transparent" />
        {overlay.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-amber-100/70 bg-amber-300 px-3 py-1 text-[11px] font-bold text-zinc-950 shadow-lg shadow-amber-300/15 sm:left-4 sm:top-4 sm:px-3.5 sm:text-xs">
            {overlay.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="flex flex-wrap gap-1.5">
          {overlay.forWhom.map((w) => (
            <span
              key={w}
              className="rounded-full border border-teal-200/15 bg-teal-300/10 px-2.5 py-1 text-[10px] font-medium text-teal-100 sm:text-[11px]"
            >
              {w}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-lg font-bold text-white group-hover:text-teal-100 sm:mt-4 sm:text-xl">
          {overlay.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-400 sm:mt-2">
          {overlay.tagline}
        </p>

        <div className="mt-4 rounded-xl border border-amber-200/20 bg-amber-300/[0.06] p-3 sm:mt-5 sm:p-4">
          <p className="mt-1 text-lg font-bold text-amber-100 sm:text-xl">{priceLabel}</p>
          {typeof plan.priceFrom === "number" && (
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
              {overlay.pricingDetail.slice(0, 3).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>

        <dl className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/35 p-2.5 sm:p-3">
            <dt className="text-[10px] text-zinc-500">{dict.planDetail.durationLabel}</dt>
            <dd className="mt-1 text-sm font-semibold text-white">{durationLabel}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/35 p-2.5 sm:p-3">
            <dt className="text-[10px] text-zinc-500">{dict.planDetail.deliveryLabel}</dt>
            <dd className="mt-1 text-sm font-semibold leading-snug text-white">{plan.deliveryCount}</dd>
          </div>
        </dl>

        <span className="mt-auto flex items-center justify-between pt-4 text-sm font-semibold text-teal-200 sm:pt-5">
          {dict.plansList.viewDetail}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
