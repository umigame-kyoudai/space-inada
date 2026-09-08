import Link from "next/link";
import { planPriceLabel, type Plan } from "@/data/plans";

function durationLabel(plan: Plan) {
  return plan.durationMin ? `約${plan.durationMin}分` : "応相談";
}

function isPopular(plan: Plan) {
  return plan.badge === "人気No.1！";
}

function PlanActions({ plan, compact = false }: { plan: Plan; compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${compact ? "text-[11px]" : "text-xs"}`}>
      <Link
        href={`/plans/${plan.slug}`}
        data-ga-event="plan_click"
        data-ga-button="plan_comparison"
        data-ga-plan={plan.name}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-mist px-2 font-semibold text-accent transition-colors hover:border-line hover:bg-mist"
      >
        詳細を見る
      </Link>
      <Link
        href={`/booking?plan=${plan.slug}&from=plan-comparison`}
        data-ga-event="reservation_click"
        data-ga-button="plan_comparison"
        data-ga-plan={plan.name}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-accent px-2 font-bold text-on-accent transition-colors hover:bg-accent-hover"
      >
        予約する
      </Link>
    </div>
  );
}

function MobileComparisonCard({ plan, index }: { plan: Plan; index: number }) {
  const popular = isPopular(plan);

  return (
    <article
      className={`cosmic-panel relative overflow-hidden rounded-2xl p-4 sm:p-5 ${
        popular ? "border-line shadow-none" : ""
      }`}
    >
      {popular && (
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-accent">
            PLAN {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">{plan.name}</h3>
        </div>
        {plan.badge && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              popular
                ? "border border-line bg-accent text-on-accent"
                : "border border-line bg-mist text-accent"
            }`}
          >
            {plan.badge}
          </span>
        )}
      </header>

      <p className="mt-2 min-h-10 text-xs leading-relaxed text-muted">
        {plan.tagline}
      </p>

      <div className="mt-4 rounded-xl border border-line bg-mist px-4 py-3">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-accent">
          料金（税込）
        </p>
        <p className="mt-1 text-xl font-bold text-accent">{planPriceLabel(plan)}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted">
          {plan.pricingDetail.slice(0, 2).join(" ／ ")}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-mist p-3">
          <dt className="text-[10px] text-muted">撮影時間</dt>
          <dd className="mt-1 text-base font-bold text-ink">{durationLabel(plan)}</dd>
        </div>
        <div className="rounded-xl border border-line bg-mist p-3">
          <dt className="text-[10px] text-muted">納品データ</dt>
          <dd className="mt-1 text-sm font-bold leading-snug text-ink">
            {plan.deliveryCount}
          </dd>
        </div>
      </dl>

      <div className="mt-3 rounded-xl border border-line bg-mist p-3">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent">
          こんな方におすすめ
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {plan.forWhom.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line bg-mist px-2.5 py-1 text-[10px] font-medium text-accent"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
          <span className="mr-2 text-accent" aria-hidden>
            +
          </span>
          {plan.features[0]}
        </p>
      </div>

      <div className="mt-4">
        <PlanActions plan={plan} />
      </div>
    </article>
  );
}

function DesktopCell({
  plan,
  children,
  className = "",
}: {
  plan: Plan;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-l border-line p-3 align-top ${
        isPopular(plan) ? "bg-mist" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** スマホはカード、PCは項目を揃えた表で表示するプラン比較。 */
export function PlanComparison({ plans }: { plans: Plan[] }) {
  return (
    <section aria-label="プラン料金・内容比較">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-mist px-4 py-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-on-accent"
        >
          1
        </span>
        <p className="text-xs leading-relaxed text-ink-soft sm:text-sm">
          迷ったら、撮影時間30分・データ全て納品の
          <strong className="mx-1 text-accent">スタンダードプラン</strong>
          がおすすめです。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {plans.map((plan, index) => (
          <MobileComparisonCard key={plan.slug} plan={plan} index={index} />
        ))}
      </div>

      <div className="cosmic-panel hidden overflow-hidden rounded-2xl lg:block">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <caption className="sr-only">
            各撮影プランの料金、撮影時間、納品データ、おすすめ対象、主な内容の比較
          </caption>
          <colgroup>
            <col className="w-24" />
            {plans.map((plan) => (
              <col key={plan.slug} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-3 text-[10px] font-semibold text-muted">
                比較項目
              </th>
              {plans.map((plan, index) => (
                <th
                  key={plan.slug}
                  scope="col"
                  className={`relative border-l border-line p-3 align-top ${
                    isPopular(plan) ? "bg-mist" : ""
                  }`}
                >
                  {isPopular(plan) && (
                    <span className="absolute inset-x-0 top-0 h-1 bg-accent" />
                  )}
                  <span className="block text-[9px] tracking-[0.18em] text-accent">
                    PLAN {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-snug text-ink">
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isPopular(plan)
                          ? "bg-accent text-on-accent"
                          : "border border-line bg-mist text-accent"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <th scope="row" className="p-3 font-medium text-muted">
                料金
                <span className="mt-0.5 block text-[9px] font-normal">税込</span>
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan}>
                  <strong className="text-sm leading-snug text-accent">
                    {planPriceLabel(plan)}
                  </strong>
                </DesktopCell>
              ))}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="p-3 font-medium text-muted">
                撮影時間
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan}>
                  <strong className="text-sm text-ink">{durationLabel(plan)}</strong>
                </DesktopCell>
              ))}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="p-3 font-medium text-muted">
                納品
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan}>
                  <span className="font-semibold leading-relaxed text-ink">
                    {plan.deliveryCount}
                  </span>
                </DesktopCell>
              ))}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="p-3 font-medium text-muted">
                おすすめ
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan}>
                  <div className="flex flex-wrap gap-1">
                    {plan.forWhom.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line bg-mist px-2 py-1 text-[9px] leading-none text-accent"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </DesktopCell>
              ))}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="p-3 font-medium text-muted">
                主な内容
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan}>
                  <p className="leading-relaxed text-ink-soft">
                    <span className="mr-1.5 text-accent" aria-hidden>
                      +
                    </span>
                    {plan.features[0]}
                  </p>
                </DesktopCell>
              ))}
            </tr>
            <tr>
              <th scope="row" className="p-3 font-medium text-muted">
                選ぶ
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan} className="p-2">
                  <PlanActions plan={plan} compact />
                </DesktopCell>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
