import Link from "next/link";
import { DELIVERY_TIME_LABEL, planPriceLabel, type Plan } from "@/data/plans";
import { ImageSlot } from "@/components/media/ImageSlot";
import { planImages } from "@/data/images";

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Link
      href={`/plans/${plan.slug}`}
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
        {plan.badge && <span className="plan-card-badge">{plan.badge}</span>}
        {plan.comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-night/55 text-on-photo">
            <span className="text-xs tracking-[.25em]">COMING SOON</span>
          </div>
        )}
      </div>
      <div className="plan-card-content">
        <p className="text-[10px] leading-6 tracking-wide text-muted">
          {plan.forWhom.join(" · ")}
        </p>
        <h3 className="mt-2 font-serif text-xl font-medium leading-relaxed text-ink">
          {plan.name}
        </h3>
        <p className="mt-2 text-xs leading-6 text-muted">{plan.tagline}</p>
        <div className="plan-card-price">
          <p className="text-[10px] text-muted">料金（税込）</p>
          <p className="mt-1 text-xl font-medium tracking-wide text-ink">
            {planPriceLabel(plan)}
          </p>
          <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-muted">
            {plan.pricingDetail.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <dl className="my-5 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[10px] text-muted">撮影時間</dt>
            <dd className="mt-2 text-ink">
              {plan.durationMin ? `約${plan.durationMin}分` : "応相談"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted">納品データ</dt>
            <dd className="mt-2 text-ink">{plan.deliveryCount}</dd>
          </div>
        </dl>
        {!plan.comingSoon && (
          <p className="mb-4 text-[10px] text-muted">
            {DELIVERY_TIME_LABEL}にオンライン納品
          </p>
        )}
        <span className="mt-auto flex items-center justify-between border-t border-line pt-4 text-xs text-accent">
          プラン詳細を見る
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            ↗
          </span>
        </span>
      </div>
    </Link>
  );
}
