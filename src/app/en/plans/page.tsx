import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlPlansListPage } from "@/components/intl/IntlPlansListPage";

export const metadata: Metadata = buildMetadata({
  title: "Photo Plans & Pricing",
  description:
    "Miyakojima starry sky photo plans: Casual, Standard, Family, Creative and Proposal. Compare pricing, duration, pickup and photographer options.",
  path: "/en/plans",
  languages: hreflangAlternates("plans"),
  ogLocale: "en_US",
});

export default function Page() {
  return <IntlPlansListPage locale="en" />;
}
