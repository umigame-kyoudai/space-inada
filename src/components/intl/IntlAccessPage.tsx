import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig, mapEmbedUrl, mapLink } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { shootingLocations } from "@/data/shootingLocations";

export function IntlAccessPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const a = dict.access;

  return (
    <Section>
      <h1 className="cosmic-title mt-6 text-3xl font-bold sm:text-4xl">{a.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{a.lead}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="cosmic-panel rounded-xl p-5">
          <dt className="text-xs text-zinc-500">{a.areaLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-white">{siteConfig.contact.areaServed}</dd>
        </div>
        <div className="cosmic-panel rounded-xl p-5">
          <dt className="text-xs text-zinc-500">{a.hoursLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-white">{siteConfig.hours.label}</dd>
          <p className="mt-1 text-xs text-zinc-500">{siteConfig.hours.description}</p>
        </div>
        <div className="cosmic-panel rounded-xl p-5">
          <dt className="text-xs text-zinc-500">{a.bookingLabel}</dt>
          <dd className="mt-1 text-base font-semibold text-white">{a.bookingValue}</dd>
          <p className="mt-1 text-xs text-zinc-500">{a.bookingNote}</p>
        </div>
      </dl>

      <div className="mt-10">
        <div className="cosmic-panel relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <iframe
            src={mapEmbedUrl()}
            title={a.areaLabel}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {a.mapNote}{" "}
          <a href={mapLink()} target="_blank" rel="noopener noreferrer" className="cosmic-link underline">
            {a.mapOpenLink}
          </a>
        </p>
      </div>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-teal-100">{a.meetingTitle}</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">{a.meetingText}</p>
        </section>

        <section id="shooting-locations" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-amber-200">{a.locationsKicker}</p>
              <h2 className="mt-2 text-2xl font-bold text-teal-100">{a.locationsTitle}</h2>
            </div>
            <span className="rounded-full border border-teal-200/20 bg-teal-200/[0.07] px-3 py-1 text-xs text-teal-100">
              {a.locationsBadge}
            </span>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-zinc-300">{a.locationsLead}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {shootingLocations.map((location, index) => (
              <article key={location.name} className="cosmic-panel rounded-xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-zinc-950">
                    {index + 1}
                  </span>
                  <span className="text-[11px] text-zinc-500">{a.locationCandidateLabel}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{location.name}</h3>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cosmic-link mt-3 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
                >
                  {a.locationMapLink}
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-amber-200/25 bg-amber-300/[0.07] p-4">
            <p className="text-sm font-bold text-amber-100">{a.finalNoticeTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">{a.finalNoticeText}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-teal-100">{a.whyTitle}</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">{a.whyText}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-teal-100">{a.transferTitle}</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">{a.transferText}</p>
        </section>
      </div>

      <div className="mt-20 flex justify-center">
        <Button href={`/${locale}/booking`} gaEvent="reservation_click" gaButton="access_page">
          {dict.nav.bookCta}
        </Button>
      </div>
    </Section>
  );
}
