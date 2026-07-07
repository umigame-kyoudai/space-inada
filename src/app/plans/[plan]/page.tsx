import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { PlanGallery } from "@/components/sections/PlanGallery";
import { planImages, proposalBookingVideo } from "@/data/images";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceJsonLd } from "@/lib/jsonld";
import { getPlan, getPlans, planPriceLabel } from "@/data/plans";

type Props = { params: Promise<{ plan: string }> };

export function generateStaticParams() {
  return getPlans().map((p) => ({ plan: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { plan: slug } = await params;
  const plan = getPlan(slug);
  if (!plan) return {};
  return buildMetadata({
    title: plan.seo.title,
    description: plan.seo.description,
    path: `/plans/${plan.slug}`,
    ownOgImage: true,
  });
}

export default async function PlanDetailPage({ params }: Props) {
  const { plan: slug } = await params;
  const plan = getPlan(slug);
  if (!plan) notFound();

  return (
    <Section>
      <JsonLd data={serviceJsonLd(plan)} />
      <Breadcrumbs
        items={[
          { name: "撮影プラン", path: "/plans" },
          { name: plan.name, path: `/plans/${plan.slug}` },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {plan.badge && (
          <span className="rounded-md border border-amber-200/70 bg-amber-300 px-3 py-1 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-300/15">
            {plan.badge}
          </span>
        )}
        {plan.forWhom.map((w) => (
          <span
            key={w}
            className="rounded-md border border-teal-200/15 bg-teal-300/10 px-3 py-1 text-xs text-teal-200"
          >
            {w}
          </span>
        ))}
      </div>

      <h1 className="cosmic-title mt-4 text-3xl font-bold sm:text-4xl">{plan.name}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">
        {plan.tagline}
      </p>

      {plan.comingSoon ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-amber-200/25 bg-amber-300/[0.06] p-5">
          <p className="text-sm font-semibold tracking-[0.28em] text-amber-200">
            COMING SOON ／ 近日公開
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-300">
            こちらのプランは現在準備中です。公開までしばらくお待ちください。
            公式LINEにご登録いただくと、公開・先行案内をいち早くお届けします。
          </p>
          <Button href="/booking?from=plan-detail">公式LINEで先行案内を受け取る</Button>
        </div>
      ) : (
        <div className="mt-6">
          <Button href={`/booking?plan=${plan.slug}&from=plan-detail`}>
            このプランを予約する
          </Button>
        </div>
      )}

      <PlanGallery images={planImages(plan)} priority />

      {/* 概要 */}
      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="cosmic-panel rounded-lg p-5">
          <dt className="text-xs text-zinc-500">料金</dt>
          <dd className="mt-1">
            <p className="text-xl font-bold text-white">{planPriceLabel(plan)}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-zinc-400">
              {plan.pricingDetail.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="cosmic-panel rounded-lg p-5">
          <dt className="text-xs text-zinc-500">撮影時間の目安</dt>
          <dd className="mt-1 text-xl font-bold text-white">
            {plan.durationMin ? `約${plan.durationMin}分` : "応相談"}
          </dd>
        </div>
        <div className="cosmic-panel rounded-lg p-5">
          <dt className="text-xs text-zinc-500">納品</dt>
          <dd className="mt-1 text-base font-semibold text-white">{plan.deliveryCount}</dd>
        </div>
      </dl>

      {/* 含まれる内容 */}
      <h2 className="mt-14 text-2xl font-bold text-teal-100">プランに含まれる内容</h2>
      <ul className="mt-6 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 text-zinc-300">
            <span aria-hidden className="text-amber-300">
              ✦
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {plan.slug === "propose" && (
        <section className="mt-14">
          <p className="cosmic-kicker text-xs font-semibold tracking-[0.2em]">
            BOOKING FLOW
          </p>
          <h2 className="mt-3 text-2xl font-bold text-teal-100">
            プロポーズ撮影のご予約・ご相談イメージ
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            ご予約フォームから公式LINEへ相談するまでの流れをご覧いただけます。
            当日の演出や段取りも、事前に相談しながら一緒に組み立てます。
          </p>
          <div className="cosmic-panel mt-6 overflow-hidden rounded-2xl bg-black sm:max-w-sm">
            <VideoPlayer video={proposalBookingVideo} autoPlay={false} />
          </div>
        </section>
      )}

      {/* 関連プラン */}
      <h2 className="mt-14 text-xl font-bold text-teal-100">ほかのプランも見る</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {getPlans()
          .filter((p) => p.slug !== plan.slug)
          .map((p) => (
            <Link
              key={p.slug}
              href={`/plans/${p.slug}`}
              className="rounded-lg border border-teal-200/15 bg-slate-950/40 px-4 py-2 text-sm text-zinc-300 hover:border-amber-200/60 hover:text-amber-100"
            >
              {p.name}
            </Link>
          ))}
      </div>

      <div className="mt-20">
        {plan.comingSoon ? (
          <CtaBooking
            heading="公開をお楽しみに｜公式LINEで先行案内"
            bookingHref="/booking"
          />
        ) : (
          <CtaBooking
            heading={`${plan.name}を予約・相談する`}
            bookingHref={`/booking?plan=${plan.slug}`}
          />
        )}
      </div>
    </Section>
  );
}
