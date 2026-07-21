import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlFaqPage } from "@/components/intl/IntlFaqPage";

export const metadata: Metadata = buildMetadata({
  title: "자주 묻는 질문",
  description: "미야코지마 별사진 촬영의 날씨, 결제, 취소, 아이 동반 등에 대한 자주 묻는 질문입니다.",
  path: "/ko/faq",
  languages: hreflangAlternates("faq"),
  ogLocale: "ko_KR",
});

export default function Page() {
  return <IntlFaqPage locale="ko" />;
}
