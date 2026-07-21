import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPlan, getPlans } from "@/data/plans";
import { IntlPlanDetailPage } from "@/components/intl/IntlPlanDetailPage";

type Props = { params: Promise<{ plan: string }> };

export function generateStaticParams() {
  return getPlans().map((p) => ({ plan: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { plan: slug } = await params;
  const plan = getPlan(slug);
  if (!plan) return {};
  const overlay = getDictionary("ko").planOverlay[plan.slug];
  return buildMetadata({
    title: overlay.name,
    description: overlay.tagline,
    path: `/ko/plans/${plan.slug}`,
    languages: hreflangAlternates({ key: "planDetail", slug: plan.slug }),
    ogLocale: "ko_KR",
    ownOgImage: true,
  });
}

export default async function Page({ params }: Props) {
  const { plan: slug } = await params;
  const plan = getPlan(slug);
  if (!plan) notFound();
  return <IntlPlanDetailPage locale="ko" plan={plan} />;
}
