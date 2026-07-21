import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlBookingPage } from "@/components/intl/IntlBookingPage";

export const metadata: Metadata = buildMetadata({
  title: "透過 LINE 預約・洽詢",
  description: "填寫預約表單並透過官方 LINE 傳送訊息，我們將於 24 小時內回覆最適合您日期的拍攝時段。",
  path: "/zh/booking",
  languages: hreflangAlternates("booking"),
  ogLocale: "zh_TW",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; from?: string }>;
}) {
  const { plan, from } = await searchParams;
  return <IntlBookingPage locale="zh" plan={plan} from={from} />;
}
