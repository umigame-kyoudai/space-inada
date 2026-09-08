import Link from "next/link";
import { planPriceLabel, type Plan } from "@/data/plans";

function durationLabel(plan: Plan) {
  return plan.durationMin ? `約${plan.durationMin}分` : "応相談";
}

function isPopular(plan: Plan) {
  return plan.badge === "人気No.1！";
}

function PlanActions({ plan }: { plan: Plan }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <Link
        href={`/plans/${plan.slug}`}
        data-ga-event="plan_click"
        data-ga-button="plan_comparison"
        data-ga-plan={plan.name}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-mist px-2 font-semibold text-accent transition-colors hover:border-line hover:bg-mist"
      >
        詳細を見る
      </Link>
      <Link
        href={`/booking?plan=${plan.slug}&from=plan-comparison`}
        data-ga-event="reservation_click"
        data-ga-button="plan_comparison"
        data-ga-plan={plan.name}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-accent px-2 font-bold text-on-accent transition-colors hover:bg-accent-hover"
      >
        予約する
      </Link>
    </div>
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

/** 項目を揃えた比較表。スマホは見出し列を固定して表だけ横スクロールする。 */
export function PlanComparison({ plans }: { plans: Plan[] }) {
  return (
    <section aria-label="プラン料金・内容比較">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-mist px-4 py-3">
        <p className="text-xs leading-relaxed text-ink-soft sm:text-sm">
          迷ったら、撮影時間30分・データ全て納品の
          <strong className="mx-1 text-accent">スタンダードプラン</strong>
          がおすすめです。
        </p>
      </div>

      <p
        id="plan-comparison-help"
        className="mb-3 text-xs leading-relaxed text-muted lg:hidden"
      >
        横にスワイプして比較できます。詳しい内容は「詳細を見る」へ。
      </p>
      <div
        role="region"
        aria-label="プラン比較表"
        aria-describedby="plan-comparison-help"
        tabIndex={0}
        className="plan-comparison-scroll cosmic-panel overflow-x-auto rounded-xl"
      >
        <table className="w-full min-w-[880px] table-fixed border-collapse text-left text-xs">
          <caption className="sr-only">
            各撮影プランの料金、撮影時間、納品データ、おすすめ対象、主な内容の比較
          </caption>
          <colgroup>
            <col className="w-20 lg:w-24" />
            {plans.map((plan) => (
              <col key={plan.slug} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-3 text-xs font-semibold text-muted">
                比較項目
              </th>
              {plans.map((plan) => (
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
                  <span className="mt-1 block text-sm font-bold leading-snug text-ink">
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
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
                <span className="mt-0.5 block text-xs font-normal">税込</span>
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
                  <strong className="text-sm text-ink">
                    {durationLabel(plan)}
                  </strong>
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
            <tr className="hidden border-b border-line lg:table-row">
              <th scope="row" className="p-3 font-medium text-muted">
                おすすめ
              </th>
              {plans.map((plan) => (
                <DesktopCell key={plan.slug} plan={plan}>
                  <div className="flex flex-wrap gap-1">
                    {plan.forWhom.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line bg-mist px-2 py-1 text-xs leading-none text-accent"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </DesktopCell>
              ))}
            </tr>
            <tr className="hidden border-b border-line lg:table-row">
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
                  <PlanActions plan={plan} />
                </DesktopCell>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
