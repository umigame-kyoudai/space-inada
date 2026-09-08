import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Brand } from "@/components/ui/Brand";
import { siteConfig } from "@/lib/seo";
import { getTestimonials } from "@/data/testimonials";
import { HeaderNav } from "./HeaderNav";
import { MobilePrimaryNav } from "./MobilePrimaryNav";
import { HeaderAutoHide } from "./HeaderAutoHide";

export function Header() {
  return (
    <header className="site-header">
      <Container className="flex h-18 max-w-[1440px] items-center justify-between gap-2 sm:gap-5 md:h-20">
        <Link href="/" aria-label={`${siteConfig.name} ホーム`}>
          <Brand />
        </Link>
        <HeaderNav showVoice={getTestimonials().length > 0} />
      </Container>
      <MobilePrimaryNav />
      <HeaderAutoHide />
    </header>
  );
}
