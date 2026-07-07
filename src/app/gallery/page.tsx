import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { GalleryMasonry } from "@/components/sections/GalleryMasonry";
import { JsonLd } from "@/components/seo/JsonLd";
import { imageGalleryJsonLd } from "@/lib/jsonld";
import { galleryImages } from "@/data/images";

export const metadata: Metadata = buildMetadata({
  title: "撮影ギャラリー｜宮古島の星空フォト作品",
  description:
    "宮古島の星空フォト撮影ギャラリー。天の川・プロポーズ・カップル・家族写真など、実際の撮影作品をご紹介します。",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <Section>
      <JsonLd data={imageGalleryJsonLd(galleryImages)} />
      <Breadcrumbs items={[{ name: "撮影ギャラリー", path: "/gallery" }]} />

      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">
        撮影ギャラリー
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        宮古島の星空のもとで撮影した作品の数々。天の川を背景にしたカップルフォト、
        プロポーズの瞬間、家族の笑顔——ここでしか残せない一枚をご覧ください。
      </p>

      <GalleryMasonry images={galleryImages} className="mt-12" priorityCount={3} />

      <div className="mt-20">
        <CtaBooking heading="あなたの一枚も、宮古島の星空で残しませんか" />
      </div>
    </Section>
  );
}
