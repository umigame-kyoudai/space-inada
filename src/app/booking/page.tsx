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

const steps = ["予約内容を入力", "送信文をコピー", "LINEで送信"];

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
    <Section className="booking-page">
      <Breadcrumbs items={[{ name: "予約フォーム", path: "/booking" }]} />

      <h1 className="cosmic-title mt-4 text-2xl sm:text-4xl">
        LINEで予約・相談する
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        予約内容を入力したら、作成された文章をコピーしてLINEのトークに貼り付けて送信してください。
      </p>

      {/* 手順 */}
      <ol className="booking-steps">
        {steps.map((s, i) => (
          <li key={s}>
            <span>{i + 1}</span>
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
