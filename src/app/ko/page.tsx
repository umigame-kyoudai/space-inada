import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlHomePage } from "@/components/intl/IntlHomePage";

export const metadata: Metadata = buildMetadata({
  title: { absolute: "미야코지마 별사진 촬영 | KEY PHOTO 미야코지마" },
  description:
    "미야코지마의 쏟아지는 별과 은하수를 배경으로 커플・기념일・가족・프러포즈의 순간을 촬영합니다. 공식 LINE으로 간편하게 예약하세요.",
  path: "/ko",
  languages: hreflangAlternates("home"),
  ogLocale: "ko_KR",
});

export default function Page() {
  return <IntlHomePage locale="ko" />;
}
