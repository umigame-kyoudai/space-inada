import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/media/ImageSlot";

export function CtaBooking({
  heading = "次の旅に、忘れられない夜を。",
  text = "日程やプランが決まっていなくても大丈夫。宮古島の星空を知るフォトグラファーが、あなたに合った撮影をご提案します。",
  bookingHref = "/booking",
}: {
  heading?: string;
  text?: string;
  bookingHref?: string;
}) {
  const trackedHref = `${bookingHref}${bookingHref.includes("?") ? "&" : "?"}from=cta`;
  return (
    <div className="booking-cta">
      <div className="absolute inset-0">
        <ImageSlot
          asset={{ src: "/images/hero/hero-star-desktop.avif", alt: "" }}
          sizes="(max-width: 1240px) 100vw, 1120px"
          className="opacity-35"
        />
      </div>
      <div className="relative max-w-2xl">
        <p className="text-[10px] tracking-[.24em] text-on-photo/80">
          YOUR NEXT MEMORY
        </p>
        <h2 className="mt-5 font-serif text-2xl font-medium leading-relaxed text-on-photo sm:text-3xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-lg text-xs leading-7 text-on-photo/85">
          {text}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={trackedHref} gaEvent="reservation_click" gaButton="cta">
            LINEで予約・相談する<span aria-hidden="true">↗</span>
          </Button>
          <Button href="/faq" variant="outline">
            よくある質問
          </Button>
        </div>
      </div>
    </div>
  );
}
