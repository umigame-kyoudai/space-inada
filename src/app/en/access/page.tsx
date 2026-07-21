import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlAccessPage } from "@/components/intl/IntlAccessPage";

export const metadata: Metadata = buildMetadata({
  title: "Access & Meeting Point",
  description:
    "Meeting point, candidate shooting locations and pickup information for Miyakojima starry sky photo sessions. Maehama Beach, Tomorihakuai and Hakucho Cape.",
  path: "/en/access",
  languages: hreflangAlternates("access"),
  ogLocale: "en_US",
});

export default function Page() {
  return <IntlAccessPage locale="en" />;
}
