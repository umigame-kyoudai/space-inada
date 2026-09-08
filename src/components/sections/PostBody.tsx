import Link from "next/link";
import type { Block } from "@/data/posts";

/** 型付きブロックを記事本文としてレンダリング（将来MDX化しても呼び出し側は不変）。 */
export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="pt-4 text-2xl font-bold text-accent">
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="space-y-2">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 text-ink-soft">
                  <span aria-hidden className="text-accent">
                    ✦
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "links") {
          return (
            <aside key={i} className="cosmic-panel rounded-lg p-5 sm:p-6">
              <h2 className="text-lg font-bold text-accent">あわせて読みたい</h2>
              <ul className="mt-4 space-y-3">
                {block.items.map((item) => {
                  const external = item.href.startsWith("http");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="group block rounded-lg border border-line bg-mist p-4 transition-colors hover:border-line"
                      >
                        <span className="font-semibold text-ink group-hover:text-accent">
                          {item.label}
                          {external ? " ↗" : " →"}
                        </span>
                        {item.description && (
                          <span className="mt-1 block text-sm leading-relaxed text-muted">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-ink-soft">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
