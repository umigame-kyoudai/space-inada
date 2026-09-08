import type { Metadata } from "next";
import { buildMetadata, siteConfig } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description:
    "星空フォト宮古島のプライバシーポリシー。お客様の個人情報の取り扱い、Cookie・アクセス解析（Google Analytics）の利用についてご説明します。",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Section>
      <Breadcrumbs items={[{ name: "プライバシーポリシー", path: "/privacy" }]} />

      <h1 className="cosmic-title mt-6 text-3xl sm:text-4xl">
        プライバシーポリシー
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        {siteConfig.name}（以下「当方」）は、お客様の個人情報を適切に取り扱うため、
        以下のとおりプライバシーポリシーを定めます。
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-accent">1. 取得する情報</h2>
          <p className="mt-3">
            当方は、撮影のご予約・お問い合わせに際して、お名前、電話番号、メールアドレス、
            SNSアカウント、宿泊先・滞在期間など、サービス提供に必要な情報を取得します。
            また、ウェブサイトの利用状況を把握するため、Cookie等を通じてアクセス情報を取得します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">2. 利用目的</h2>
          <ul className="mt-3 space-y-2">
            <li>・撮影サービスのご予約受付、ご連絡、当日の運営のため</li>
            <li>・お問い合わせへの対応のため</li>
            <li>・サービスの品質向上、ウェブサイトの改善のため</li>
            <li>・ご本人の同意がある場合の、撮影作品の実績紹介のため</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">
            3. アクセス解析ツール（Cookie）について
          </h2>
          <p className="mt-3">
            当サイトでは、サービス向上のためアクセス解析ツール「Google Analytics（GA4）」を
            利用しています。Google Analytics はトラフィックデータの収集のために Cookie を使用します。
            このデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className="mt-3">
            Cookie はブラウザの設定で無効化することができます。また、Google による
            データ収集の仕組みおよび利用規約については、Google のプライバシーポリシー
            （
            <a
              href="https://policies.google.com/privacy?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-link underline"
            >
              policies.google.com/privacy
            </a>
            ）をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">4. 個人情報の第三者提供</h2>
          <p className="mt-3">
            当方は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">5. 個人情報の管理</h2>
          <p className="mt-3">
            当方は、取得した個人情報の漏えい・滅失・毀損の防止その他の安全管理のために、
            必要かつ適切な措置を講じます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">6. 開示・訂正・削除</h2>
          <p className="mt-3">
            ご本人から個人情報の開示・訂正・利用停止・削除等のご請求があった場合は、
            ご本人であることを確認のうえ、法令に従い速やかに対応します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">7. お問い合わせ窓口</h2>
          <p className="mt-3">
            本ポリシーに関するお問い合わせは、下記までご連絡ください。
          </p>
          <p className="mt-3">
            {siteConfig.name}
            <br />
            Email：
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="cosmic-link underline"
            >
              {siteConfig.contact.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-accent">8. 改定</h2>
          <p className="mt-3">
            本ポリシーの内容は、法令の変更やサービスの変更に応じて、予告なく改定することがあります。
            改定後の内容は当サイトに掲載した時点で効力を生じます。
          </p>
        </section>

        <p className="text-xs text-muted">制定日：2026年6月5日</p>
      </div>
    </Section>
  );
}
