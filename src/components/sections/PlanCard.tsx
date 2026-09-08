import Link from "next/link";
import { planPriceLabel, type Plan } from "@/data/plans";
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
          sizes="(max-width: 767px) 76vw, 312px"
        />
        {plan.badge && <span className="plan-card-badge">{plan.badge}</span>}
        {plan.comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-night/55 text-on-photo">
            <span className="text-xs tracking-[.25em]">COMING SOON</span>
          </div>
        )}
      </div>
      <div className="plan-card-content">
        <p className="plan-card-audience">
          {plan.forWhom.join(" · ")}
        </p>
        <h3 className="plan-card-title">
          {plan.name}
        </h3>
        <div className="plan-card-price">
          <p className="plan-card-amount">
            {planPriceLabel(plan)}
          </p>
          {typeof plan.priceFrom === "number" && <span>税込</span>}
        </div>
        <dl className="plan-card-meta">
          <div>
            <dt>撮影時間</dt>
            <dd>
              {plan.durationMin ? `約${plan.durationMin}分` : "応相談"}
            </dd>
          </div>
          <div>
            <dt>納品データ</dt>
            <dd>{plan.deliveryCount}</dd>
          </div>
        </dl>
        <span className="plan-card-link">
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
