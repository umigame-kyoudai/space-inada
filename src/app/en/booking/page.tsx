import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { hreflangAlternates } from "@/lib/i18n/locales";
import { IntlBookingPage } from "@/components/intl/IntlBookingPage";

export const metadata: Metadata = buildMetadata({
  title: "Book or Ask via LINE",
  description:
    "Fill in the booking form and message our official LINE. We'll reply within 24 hours with the best shooting time for your date.",
  path: "/en/booking",
  languages: hreflangAlternates("booking"),
  ogLocale: "en_US",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; from?: string }>;
}) {
  const { plan, from } = await searchParams;
  return <IntlBookingPage locale="en" plan={plan} from={from} />;
}
