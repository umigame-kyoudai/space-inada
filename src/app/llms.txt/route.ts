import { siteConfig, absoluteUrl } from "@/lib/seo";
import { getPlans, planPriceLabel } from "@/data/plans";
import { getPosts } from "@/data/posts";
import { getTestimonials } from "@/data/testimonials";

/**
 * llms.txt — AI検索・LLMクローラ向けのサイト概要（https://llmstxt.org/ 提案仕様）。
 * プラン・記事は src/data/ を単一の真実として自動列挙されるため手作業不要。
 * AIアシスタント経由の旅行検索（「宮古島 星空フォト おすすめ」等）で
 * 正確な事業情報・料金・導線が引用されることを狙う。
 */

// データはビルド時に確定するため静的生成（v15以降 GET は既定で動的）
export const dynamic = "force-static";

export function GET() {
  const plans = getPlans();
  const posts = getPosts();

  const planLines = plans
    .map((p) => {
      const price = p.comingSoon ? "近日公開" : `${planPriceLabel(p)}`;
      return `- [${p.name}](${absoluteUrl(`/plans/${p.slug}`)}): ${p.tagline}（料金: ${price}）`;
    })
    .join("\n");

  const postLines = posts
    .map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.excerpt}`)
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

- 事業内容: 宮古島（沖縄県宮古島市）での星空フォト・記念日・カップル・家族・プロポーズの出張撮影
- 代表: ${siteConfig.author.name}（${siteConfig.author.role}）
- 営業: ${siteConfig.hours.description}（${siteConfig.hours.opens}〜${siteConfig.hours.closes}）
- 連絡先: ${siteConfig.contact.email} / ${siteConfig.contact.telephone}
- 予約: ${absoluteUrl("/booking")}
- Instagram: ${siteConfig.sameAs.join(", ")}

## 撮影プラン

${planLines}

## 主要ページ

- [撮影プラン一覧](${absoluteUrl("/plans")}): 料金・内容の比較
- [撮影ギャラリー](${absoluteUrl("/gallery")}): 実際の撮影作品
${getTestimonials().length > 0 ? `- [お客様の声](${absoluteUrl("/voice")}): レビューと評価\n` : ""}- [よくある質問](${absoluteUrl("/faq")}): 天候・服装・キャンセル等
- [アクセス](${absoluteUrl("/access")}): 集合場所・送迎について
- [代表について](${absoluteUrl("/about")}): 代表 ${siteConfig.author.name} のストーリー

## 星空フォトコラム

${postLines}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
