import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export function IntlFaqPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <Section>
      <h1 className="cosmic-title mt-6 text-3xl sm:text-4xl">{dict.faq.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{dict.faq.lead}</p>

      <div className="mt-10 space-y-4">
        {dict.faq.items.map((item) => (
          <details key={item.q} className="cosmic-panel group rounded-xl p-5">
            <summary className="cursor-pointer list-none text-base font-bold text-ink marker:content-none">
              <span className="mr-2 text-accent">Q.</span>
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              <span className="mr-2 font-bold text-accent">A.</span>
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Button href={`/${locale}/booking`} gaEvent="reservation_click" gaButton="faq_page">
          {dict.nav.bookCta}
        </Button>
      </div>
    </Section>
  );
}
