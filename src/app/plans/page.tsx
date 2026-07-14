import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PlanCard } from "@/components/sections/PlanCard";
import { PlanComparison } from "@/components/sections/PlanComparison";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  DELIVERY_TIME_LABEL,
  getPlans,
  getPlanOptions,
  formatPrice,
} from "@/data/plans";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "撮影プラン一覧",
  description:
    "宮古島の星空フォト撮影プラン。カジュアル・スタンダード・ファミリー・クリエイティブ・プロポーズと送迎・カメラマン指名・深夜料金をご紹介します。",
  path: "/plans",
});

export default function PlansPage() {
  const plans = getPlans();
  const options = getPlanOptions();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: absoluteUrl(`/plans/${p.slug}`),
    })),
  };

  return (
    <Section>
      <JsonLd data={itemList} />
      <Breadcrumbs items={[{ name: "撮影プラン", path: "/plans" }]} />
      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">
        宮古島の星空フォト 撮影プラン
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        気軽なカジュアルから、記念日・プロポーズの特別な撮影まで。ご希望や人数、シーンに合わせてお選びいただけます。
      </p>
      <p className="mt-3 max-w-2xl text-sm font-medium text-amber-100/80">
        撮影データは全プラン{DELIVERY_TIME_LABEL}にオンラインで納品します。
      </p>

      <div
        aria-label="撮影プラン一覧"
        className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
      >
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className="w-[78%] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink"
          >
            <PlanCard plan={plan} />
          </div>
        ))}
      </div>

      <h2 className="mt-20 text-2xl font-bold text-teal-100">料金・内容の比較</h2>
      <p className="mt-3 text-sm text-zinc-400">
        各プランの料金・撮影時間・納品内容を一覧で比較できます。
      </p>
      <div className="mt-6">
        <PlanComparison plans={plans.filter((p) => !p.comingSoon)} />
      </div>

      {/* オプション・追加料金 */}
      <h2 className="mt-20 text-2xl font-bold text-teal-100">オプション・追加料金</h2>
      <p className="mt-3 text-sm text-zinc-400">
        ご予約時に選べるオプションと、撮影時間に応じてかかる追加料金です。
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {options.map((opt) => (
          <div
            key={opt.name}
            className="cosmic-panel rounded-lg p-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-white">{opt.name}</h3>
              <span className="text-base font-bold text-amber-200">
                {typeof opt.priceFrom === "number"
                  ? `${formatPrice(opt.priceFrom)}${opt.priceSuffix ?? "〜"}`
                  : opt.priceNote}
              </span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-zinc-400">
              {opt.detail.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <CtaBooking />
      </div>
    </Section>
  );
}
