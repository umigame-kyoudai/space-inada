import { PlanCard } from "./PlanCard";
import { getPlan, type PlanSlug } from "@/data/plans";

/** 記事 → 関連プランへの内部リンク（検索流入を予約導線へ送る）。 */
export function RelatedPlans({ slugs }: { slugs: PlanSlug[] }) {
  const plans = slugs.map(getPlan).filter((p) => p !== undefined);
  if (plans.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-ink">この記事に関連する撮影プラン</h2>
      <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className="w-[78%] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink"
          >
            <PlanCard plan={plan} />
          </div>
        ))}
      </div>
    </section>
  );
}
