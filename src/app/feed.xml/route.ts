import { siteConfig, absoluteUrl } from "@/lib/seo";
import { getPosts } from "@/data/posts";
import { postImage } from "@/data/images";

/**
 * ブログのRSSフィード。
 * 記事は src/data/posts.ts を単一の真実として自動列挙されるため、
 * 記事追加時にこのファイルの手作業は不要。
 * 新着記事の発見・クロールを促し、RSSリーダー経由の再訪も獲得する。
 */

// 記事データはビルド時に確定するため静的生成（v15以降 GET は既定で動的）
export const dynamic = "force-static";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = [...getPosts()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  const lastBuildDate = new Date(
    Math.max(...posts.map((p) => new Date(p.updatedAt).getTime())),
  ).toUTCString();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const cover = postImage(post);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>${
        cover.src
          ? `\n      <enclosure url="${absoluteUrl(cover.src)}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`星空フォトコラム｜${siteConfig.name}`)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
