import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlBookingPage } from "@/components/intl/IntlBookingPage";

export const metadata: Metadata = buildMetadata({
  title: "LINE으로 예약・상담하기",
  description: "예약 폼을 작성하고 공식 LINE으로 메시지를 보내주세요. 24시간 이내에 희망 날짜에 맞는 최적의 촬영 시간을 안내해 드립니다.",
  path: "/ko/booking",
  languages: hreflangAlternates("booking"),
  ogLocale: "ko_KR",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; from?: string }>;
}) {
  const { plan, from } = await searchParams;
  return <IntlBookingPage locale="ko" plan={plan} from={from} />;
}
