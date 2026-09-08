import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export type Crumb = { name: string; path: string };

/**
 * パンくず（表示 + BreadcrumbList 構造化データ）。
 * ホームを先頭に自動付与。最後の要素は現在地としてリンクなし表示。
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: "ホーム", path: "/" }, ...items];
  return (
    <nav aria-label="パンくず" className="text-sm text-muted">
      <JsonLd data={breadcrumbJsonLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-ink-soft">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-ink">
                  {c.name}
                </Link>
              )}
              {!isLast && <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
