import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/seo";
import { getTestimonials } from "@/data/testimonials";
import { HeaderNav } from "./HeaderNav";
import { MobilePrimaryNav } from "./MobilePrimaryNav";
import { HeaderAutoHide } from "./HeaderAutoHide";

export function Header() {
  // お客様の声は実際の声が1件以上あるときだけナビに表示（data/testimonials.ts に追加で自動復帰）
  const showVoice = getTestimonials().length > 0;
  return (
    <header className="site-header sticky top-0 z-50 border-b border-teal-200/10 bg-[#03040a]/82 shadow-lg shadow-black/20 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2 text-base font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
          <span className="group-hover:text-amber-100">{siteConfig.name}</span>
        </Link>
        <HeaderNav showVoice={showVoice} />
      </Container>
      <MobilePrimaryNav />
      <HeaderAutoHide />
    </header>
  );
}
