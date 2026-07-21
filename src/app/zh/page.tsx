import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlHomePage } from "@/components/intl/IntlHomePage";

export const metadata: Metadata = buildMetadata({
  title: { absolute: "宮古島星空攝影 | KEY PHOTO 宮古島" },
  description:
    "以宮古島璀璨的星空與銀河為背景，為情侶、紀念日、家庭與求婚拍下珍貴的一刻。透過官方 LINE 輕鬆預約。",
  path: "/zh",
  languages: hreflangAlternates("home"),
  ogLocale: "zh_TW",
});

export default function Page() {
  return <IntlHomePage locale="zh" />;
}
