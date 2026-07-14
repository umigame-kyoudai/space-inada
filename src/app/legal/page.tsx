import type { Metadata } from "next";
import { buildMetadata, siteConfig } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  getPriceRange,
  getPickupPrice,
  formatPrice,
  INADA_NOMINATION_PRICE,
  LATE_NIGHT_FEES,
} from "@/data/plans";

export const metadata: Metadata = buildMetadata({
  title: "特定商取引法に基づく表記",
  description:
    "星空フォト宮古島の特定商取引法に基づく表記。販売事業者、料金、お支払い方法、キャンセル・返金、役務の提供時期について記載しています。",
  path: "/legal",
});

/**
 * ⚠️ 公開前に確定値へ差し替えてください（TODO）。
 *  - 運営責任者名は siteConfig.author.name（稲田圭市）を使用。
 *  - 電話番号は siteConfig.contact.telephone を使用。
 *  - 所在地は個人事業者の運用として「請求時に遅滞なく開示」としています。
 *    常時掲載する場合は下記所在地の行を実値に置き換えてください。
 */
export default function LegalPage() {
  const range = getPriceRange();
  const pickupPrice = getPickupPrice();
  const priceText = range
    ? `各撮影プランごとに表示します（${formatPrice(range.min)}〜${formatPrice(range.max)}・税込、一部プランは個別見積り）。詳細は各プランページをご確認ください。`
    : "各撮影プランごとに表示します。詳細は各プランページをご確認ください。";

  const rows: { term: string; desc: React.ReactNode }[] = [
    { term: "販売事業者", desc: siteConfig.name },
    { term: "運営統括責任者", desc: siteConfig.author.name },
    {
      term: "所在地",
      desc: "請求があった場合は遅滞なく開示します。",
    },
    {
      term: "電話番号",
      desc: siteConfig.contact.telephone
        ? siteConfig.contact.telephone
        : "請求があった場合は遅滞なく開示します。",
    },
    {
      term: "メールアドレス",
      desc: (
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="cosmic-link underline"
        >
          {siteConfig.contact.email}
        </a>
      ),
    },
    {
      term: "販売価格",
      desc: priceText,
    },
    {
      term: "商品代金以外の必要料金",
      desc: `送迎（3名まで）${formatPrice(pickupPrice)}、稲田のカメラマン指名${formatPrice(INADA_NOMINATION_PRICE)}、深夜料金（0:00〜0:59は1人${formatPrice(LATE_NIGHT_FEES.midnight)}、1:00以降は1人${formatPrice(LATE_NIGHT_FEES.afterOne)}）など、選択内容や撮影時間に応じて追加料金がかかります。最終金額はLINEでご案内します。`,
    },
    {
      term: "お支払い方法",
      desc: "撮影当日の現地現金決済のみです。",
    },
    {
      term: "お支払い時期",
      desc: "撮影当日にお支払いいただきます。",
    },
    {
      term: "役務の提供時期",
      desc: "撮影は予約日時に実施します。撮影データは、撮影後に各プランの納品内容に従ってオンラインで納品します。",
    },
    {
      term: "キャンセル・返金について",
      desc: "お客様都合のキャンセルは、撮影日の4日前まで無料、3日前・2日前は料金の50%、前日・当日は100%のキャンセル料を申し受けます。天候不良による中止の場合はキャンセル料はいただかず、日程振替または返金で対応します。",
    },
    {
      term: "動作環境・その他",
      desc: "撮影データの閲覧・ダウンロードにはインターネット接続環境が必要です。",
    },
  ];

  return (
    <Section>
      <Breadcrumbs items={[{ name: "特定商取引法に基づく表記", path: "/legal" }]} />

      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">
        特定商取引法に基づく表記
      </h1>

      <dl className="cosmic-panel mt-12 divide-y divide-teal-200/10 rounded-lg px-5 text-sm">
        {rows.map((row) => (
          <div key={row.term} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="font-semibold text-zinc-200">{row.term}</dt>
            <dd className="leading-relaxed text-zinc-400">{row.desc}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
