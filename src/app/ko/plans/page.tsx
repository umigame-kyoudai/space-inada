import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlPlansListPage } from "@/components/intl/IntlPlansListPage";

export const metadata: Metadata = buildMetadata({
  title: "촬영 플랜・요금 안내",
  description:
    "미야코지마 별사진 촬영 플랜: 캐주얼・스탠다드・패밀리・크리에이티브・프러포즈. 요금・촬영 시간・픽업・카메라맨 지명 옵션을 비교해 보세요.",
  path: "/ko/plans",
  languages: hreflangAlternates("plans"),
  ogLocale: "ko_KR",
});

export default function Page() {
  return <IntlPlansListPage locale="ko" />;
}
