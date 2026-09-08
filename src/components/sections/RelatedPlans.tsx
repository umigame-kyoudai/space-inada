import { PlanCard } from "./PlanCard";
import { PlanCarousel } from "./PlanCarousel";
import { getPlan, type PlanSlug } from "@/data/plans";

/** 記事 → 関連プランへの内部リンク（検索流入を予約導線へ送る）。 */
export function RelatedPlans({ slugs }: { slugs: PlanSlug[] }) {
  const plans = slugs.map(getPlan).filter((p) => p !== undefined);
  if (plans.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-ink">この記事に関連する撮影プラン</h2>
      <PlanCarousel label="この記事に関連する撮影プラン">
        {plans.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </PlanCarousel>
    </section>
  );
}
