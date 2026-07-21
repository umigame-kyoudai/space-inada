import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlHomePage } from "@/components/intl/IntlHomePage";

export const metadata: Metadata = buildMetadata({
  title: { absolute: "Miyakojima Starry Sky Photo | KEY PHOTO Miyakojima" },
  description:
    "Under Miyakojima's brilliant stars and Milky Way, we photograph couples, anniversaries, families and proposals. Book your starry night session on official LINE.",
  path: "/en",
  languages: hreflangAlternates("home"),
  ogLocale: "en_US",
});

export default function Page() {
  return <IntlHomePage locale="en" />;
}
