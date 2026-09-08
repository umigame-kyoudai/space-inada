import { Section } from "@/components/ui/Section";
import { BookingForm } from "@/components/booking/BookingForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { getBookablePlans, planPriceKind, getPickupPrice, INADA_NOMINATION_PRICE } from "@/data/plans";

export function IntlBookingPage({
  locale,
  plan,
  from,
}: {
  locale: Locale;
  plan?: string;
  from?: string;
}) {
  const dict = getDictionary(locale);
  const planOptions = getBookablePlans().map((p) => ({
    slug: p.slug,
    name: p.name, // ← 送信メッセージ・GAS解析のため日本語名を維持（変更しないこと）
    label: dict.planOverlay[p.slug].name, // 画面表示のみ翻訳
    kind: planPriceKind(p),
    basePrice: p.priceFrom ?? null,
    childPrice: p.childPrice ?? null,
    maxParticipants: p.maxParticipants ?? null,
  }));
  const pickupPrice = getPickupPrice();

  return (
    <Section>
      <h1 className="cosmic-title mt-6 text-3xl sm:text-4xl">{dict.booking.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{dict.booking.lead}</p>

      <ol className="mt-8 flex flex-wrap gap-2 text-xs">
        {dict.booking.steps.map((s, i) => (
          <li
            key={s}
            className="cosmic-panel flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-ink-soft"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-on-accent">
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
        staffNominationPrice={INADA_NOMINATION_PRICE}
        from={from}
        dict={dict}
        locale={locale}
      />
    </Section>
  );
}
