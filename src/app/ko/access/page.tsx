import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlAccessPage } from "@/components/intl/IntlAccessPage";

export const metadata: Metadata = buildMetadata({
  title: "오시는 길・집합 장소",
  description:
    "미야코지마 별사진 촬영의 집합 장소, 촬영 후보지, 픽업 서비스 안내. 마에하마・도모리하쿠아이・하쿠초미사키.",
  path: "/ko/access",
  languages: hreflangAlternates("access"),
  ogLocale: "ko_KR",
});

export default function Page() {
  return <IntlAccessPage locale="ko" />;
}
