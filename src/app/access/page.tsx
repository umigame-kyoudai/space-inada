import type { Metadata } from "next";
import { buildMetadata, siteConfig, mapEmbedUrl, mapLink } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { shootingLocations } from "@/data/shootingLocations";

export const metadata: Metadata = buildMetadata({
  title: "アクセス・集合場所",
  description:
    "宮古島の星空フォト撮影の集合場所・候補地・送迎についてのご案内。前浜・友利博愛・白鳥岬などから、当日に最適な撮影場所をお伝えします。",
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

        <section id="shooting-locations" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-amber-200">
                SHOOTING LOCATION CANDIDATES
              </p>
              <h2 className="mt-2 text-2xl font-bold text-teal-100">主な撮影候補地</h2>
            </div>
            <span className="rounded-full border border-teal-200/20 bg-teal-200/[0.07] px-3 py-1 text-xs text-teal-100">
              宮古島内の3エリア
            </span>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-zinc-300">
            通常は、前浜・友利博愛・白鳥岬周辺を主な候補として撮影しています。
            事前に開催エリアの目安をご確認いただけますが、下記の場所で必ず開催するという意味ではありません。
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {shootingLocations.map((location, index) => (
              <article key={location.name} className="cosmic-panel rounded-xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-zinc-950">
                    {index + 1}
                  </span>
                  <span className="text-[11px] text-zinc-500">撮影候補地</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{location.name}</h3>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cosmic-link mt-3 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
                >
                  Googleマップで確認
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-amber-200/25 bg-amber-300/[0.07] p-4">
            <p className="text-sm font-bold text-amber-100">最終的な集合場所は撮影当日に決定します</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              雲の動き・風向き・月明かり・周辺の明るさを確認し、その日に最もきれいな星空を撮影できる場所をご案内します。
              状況によっては、上記以外の場所をご案内することがあります。
            </p>
          </div>
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
