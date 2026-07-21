import { HtmlLangSync } from "@/components/layout/HtmlLangSync";
import { LOCALE_HTML_LANG } from "@/lib/i18n/locales";

export default function KoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLangSync lang={LOCALE_HTML_LANG.ko} />
      {children}
    </>
  );
}
