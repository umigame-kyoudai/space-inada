import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlFaqPage } from "@/components/intl/IntlFaqPage";

export const metadata: Metadata = buildMetadata({
  title: "常見問題",
  description: "關於宮古島星空攝影的天候、付款方式、取消政策與親子同行等常見問題。",
  path: "/zh/faq",
  languages: hreflangAlternates("faq"),
  ogLocale: "zh_TW",
});

export default function Page() {
  return <IntlFaqPage locale="zh" />;
}
