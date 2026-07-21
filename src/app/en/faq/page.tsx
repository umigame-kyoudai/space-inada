import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlFaqPage } from "@/components/intl/IntlFaqPage";

export const metadata: Metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Common questions about weather, payment, cancellations and children joining our Miyakojima starry sky photo sessions.",
  path: "/en/faq",
  languages: hreflangAlternates("faq"),
  ogLocale: "en_US",
});

export default function Page() {
  return <IntlFaqPage locale="en" />;
}
