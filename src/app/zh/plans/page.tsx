import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlPlansListPage } from "@/components/intl/IntlPlansListPage";

export const metadata: Metadata = buildMetadata({
  title: "拍攝方案與價格",
  description: "宮古島星空攝影方案：輕鬆體驗・標準・家庭・創意・求婚。比較價格、拍攝時間、接送與指定攝影師等選項。",
  path: "/zh/plans",
  languages: hreflangAlternates("plans"),
  ogLocale: "zh_TW",
});

export default function Page() {
  return <IntlPlansListPage locale="zh" />;
}
