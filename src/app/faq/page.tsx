import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/jsonld";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = buildMetadata({
  title: "よくある質問",
  description:
    "宮古島の星空フォトに関するよくある質問。天候・服装・支払い・キャンセル・お子様の参加・送迎・納品方法について回答します。",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <Section>
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={[{ name: "よくある質問", path: "/faq" }]} />

      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">よくある質問</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        天候、服装、お支払い、キャンセル、お子様の参加、送迎、納品方法についてお答えします。その他のご質問もお気軽にお問い合わせください。
      </p>

      <div className="cosmic-panel mt-12 divide-y divide-teal-200/10 rounded-lg px-5">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-white">
              {f.q}
              <span
                aria-hidden
                className="text-teal-200 transition-transform group-open:rotate-45"
              >
                ＋
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-20">
        <CtaBooking />
      </div>
    </Section>
  );
}
