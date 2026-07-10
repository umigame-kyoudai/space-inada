import { Button } from "@/components/ui/Button";

/**
 * 全ページから予約導線（/booking → 公式LINE）へ送る共通CTA。
 */
export function CtaBooking({
  heading = "宮古島の星空フォトを予約する",
  text = "ご希望の日程・人数・プランをフォームに入力し、公式LINEで送信するだけ。当日の天候や月齢に合わせて、最適な撮影をご提案します。",
  bookingHref = "/booking",
}: {
  heading?: string;
  text?: string;
  bookingHref?: string;
}) {
  // CV計測: どのCTAから予約フォームに来たかを from で識別する
  const trackedHref = `${bookingHref}${bookingHref.includes("?") ? "&" : "?"}from=cta`;
  return (
    <div className="cosmic-panel relative overflow-hidden rounded-lg p-8 text-center sm:p-12">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
      <h2 className="cosmic-title text-2xl font-bold sm:text-3xl">{heading}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300">
        {text}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href={trackedHref} gaEvent="reservation_click" gaButton="cta">
          LINEで予約・相談する
        </Button>
        <Button href="/faq" variant="outline">
          よくある質問
        </Button>
      </div>
    </div>
  );
}
