import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlAccessPage } from "@/components/intl/IntlAccessPage";

export const metadata: Metadata = buildMetadata({
  title: "交通與集合地點",
  description: "宮古島星空攝影的集合地點、候選拍攝地點與接送服務說明。前浜・友利博愛・白鳥岬。",
  path: "/zh/access",
  languages: hreflangAlternates("access"),
  ogLocale: "zh_TW",
});

export default function Page() {
  return <IntlAccessPage locale="zh" />;
}
