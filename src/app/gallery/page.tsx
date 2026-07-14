import type { Metadata } from "next";
import { buildMetadata, siteConfig } from "@/lib/seo";
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
        宮古島の星空のもとで撮影した作品の数々。天の川を背景にしたカップルフォト、プロポーズの瞬間、家族の笑顔——ここでしか残せない一枚をご覧ください。
      </p>

      <GalleryMasonry images={galleryImages} className="mt-12" priorityCount={3} />

      {/* JSON-LD の license / acquireLicensePage が指すセクション */}
      <div id="image-license" className="mt-16 max-w-2xl">
        <h2 className="text-lg font-semibold text-zinc-200">
          掲載写真の著作権・ご利用について
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          当サイトに掲載している写真の著作権は、すべて{siteConfig.name}
          （撮影：{siteConfig.author.name}）に帰属します。
          無断での転載・複製・二次利用はご遠慮ください。
          掲載写真のご利用をご希望の場合は、
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="cosmic-link underline"
          >
            {siteConfig.contact.email}
          </a>
          までお問い合わせください。
        </p>
      </div>

      <div className="mt-20">
        <CtaBooking heading="あなたの一枚も、宮古島の星空で残しませんか" />
      </div>
    </Section>
  );
}
