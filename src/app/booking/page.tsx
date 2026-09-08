import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
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
  languages: hreflangAlternates("booking"),
});

const steps = [
  { title: "予約内容を入力", text: "日程・プラン・人数を選択" },
  { title: "送信文をコピー", text: "内容を確認してコピー" },
  { title: "LINEで相談", text: "トークに貼り付けて送信" },
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
    maxParticipants: p.maxParticipants ?? null,
  }));
  const pickupPrice = getPickupPrice();
  const staffNominationPrice = INADA_NOMINATION_PRICE;

  return (
    <Section>
      <Breadcrumbs items={[{ name: "予約フォーム", path: "/booking" }]} />

      <h1 className="cosmic-title mt-6 text-3xl sm:text-4xl">
        LINEで予約・相談する
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        下のフォームに入力すると、公式LINEへ送る文章が自動で作られます。「内容をコピーする」→「公式LINEを開く」の順に進み、トークに貼り付けて送信してください。
      </p>

      {/* 手順 */}
      <ol className="mt-8 grid grid-cols-3 gap-3 rounded-md border border-line bg-white p-4 sm:max-w-2xl sm:gap-6 sm:p-6">
        {steps.map((s, i) => (
          <li key={s.title} className="text-ink-soft">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-on-accent">
              {i + 1}
            </span>
            <p className="mt-3 text-xs font-medium leading-6 text-ink">
              {s.title}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-muted">{s.text}</p>
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
