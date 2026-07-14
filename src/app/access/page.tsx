import type { Metadata } from "next";
import { buildMetadata, siteConfig, mapEmbedUrl, mapLink } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBooking } from "@/components/sections/CtaBooking";

export const metadata: Metadata = buildMetadata({
  title: "アクセス・集合場所",
  description:
    "宮古島の星空フォト撮影の集合場所・送迎についてのご案内。撮影スポットは天候と月齢で変わるため、撮影当日に最適な集合場所をお伝えします。",
  path: "/access",
});

export default function AccessPage() {
  return (
    <Section>
      <Breadcrumbs items={[{ name: "アクセス", path: "/access" }]} />

      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">
        アクセス・集合場所のご案内
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        対応エリアは{siteConfig.contact.areaServed}全域です。
        宮古島内の各エリアから撮影スポットへご案内します。
      </p>

      {/* 対応エリア・撮影時間 */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="cosmic-panel rounded-lg p-5">
          <dt className="text-xs text-zinc-500">対応エリア</dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {siteConfig.contact.areaServed}全域
          </dd>
        </div>
        <div className="cosmic-panel rounded-lg p-5">
          <dt className="text-xs text-zinc-500">撮影時間</dt>
          <dd className="mt-1 text-base font-semibold text-white">
            {siteConfig.hours.label}
          </dd>
          <p className="mt-1 text-xs text-zinc-500">{siteConfig.hours.description}</p>
        </div>
        <div className="cosmic-panel rounded-lg p-5">
          <dt className="text-xs text-zinc-500">予約方法</dt>
          <dd className="mt-1 text-base font-semibold text-white">公式LINE</dd>
          <p className="mt-1 text-xs text-zinc-500">フォームから簡単にご相談いただけます</p>
        </div>
      </dl>

      {/* 対応エリアマップ */}
      <div className="mt-10">
        <div className="cosmic-panel relative aspect-[16/9] w-full overflow-hidden rounded-lg sm:aspect-[21/9]">
          <iframe
            src={mapEmbedUrl()}
            title={`${siteConfig.contact.areaServed}の対応エリアマップ`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          ※地図は対応エリア（{siteConfig.contact.locality}）の目安です。具体的な集合場所は撮影当日にLINEでご案内します。
          {" "}
          <a
            href={mapLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-link underline"
          >
            Googleマップで開く
          </a>
        </p>
      </div>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-teal-100">集合場所について</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            集合場所は、ご予約いただいたプランと当日のコンディションに合わせて、撮影当日にLINEで個別にご案内します。
            ご宿泊先やご希望エリアを事前にお知らせいただければ、移動の負担が少ないスポットを選定します。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-teal-100">
            なぜ撮影スポットを当日にご案内するのか
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            宮古島の星空が最も美しく見える場所は、その日の天候・月齢・風向きで変わります。
            また、貴重な自然環境を守るため、撮影地のマナーやキャパシティにも配慮しています。
            こうした理由から、最適なスポットは撮影当日にLINEで個別にお伝えしています。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-teal-100">宮古島内の移動・送迎</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            星空スポットは街灯の少ない場所が多く、夜間の移動には不安がつきものです。
            プランや滞在場所に応じて送迎をご相談いただけますので、
            運転に不安のある方や夜のお出かけが初めての方もお気軽にお問い合わせください。
          </p>
        </section>
      </div>

      <div className="mt-20">
        <CtaBooking />
      </div>
    </Section>
  );
}
