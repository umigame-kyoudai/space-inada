import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BookingForm } from "@/components/booking/BookingForm";
import {
  getBookablePlans,
  planPriceKind,
  getPickupPrice,
  INADA_NOMINATION_PRICE,
} from "@/data/plans";

export const metadata: Metadata = buildMetadata({
  title: "予約フォーム",
  description:
    "宮古島の星空フォト撮影の予約フォーム。入力内容をコピーして公式LINEから簡単に予約相談できます。",
  path: "/booking",
});

const steps = [
  "フォームに予約内容を入力",
  "自動生成された送信文を確認",
  "「内容をコピーする」を押す",
  "「公式LINEを開く」を押す",
  "LINEに貼り付けて送信",
];

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; from?: string }>;
}) {
  const { plan, from } = await searchParams;
  const planOptions = getBookablePlans().map((p) => ({
    slug: p.slug,
    name: p.name,
    kind: planPriceKind(p),
    basePrice: p.priceFrom ?? null,
    childPrice: p.childPrice ?? null,
  }));
  const pickupPrice = getPickupPrice();
  const staffNominationPrice = INADA_NOMINATION_PRICE;

  return (
    <Section>
      <Breadcrumbs items={[{ name: "予約フォーム", path: "/booking" }]} />

      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">
        LINEで予約・相談する
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        下のフォームに入力すると、公式LINEへ送る文章が自動で作られます。
        「内容をコピーする」→「公式LINEを開く」の順に進み、トークに貼り付けて送信してください。
      </p>

      {/* 手順 */}
      <ol className="mt-8 flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => (
          <li
            key={s}
            className="cosmic-panel flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-zinc-300"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-300 text-[11px] font-bold text-zinc-950">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <BookingForm
        planOptions={planOptions}
        defaultPlan={plan}
        pickupPrice={pickupPrice}
        staffNominationPrice={staffNominationPrice}
        from={from}
      />
    </Section>
  );
}
