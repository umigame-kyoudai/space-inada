"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageSlot } from "@/components/media/ImageSlot";
import type { ImageAsset } from "@/data/images";

/**
 * 縦・横の写真をそのまま活かすマソンリー（2列）＋タップで拡大するライトボックス。
 *
 * CSS の `columns` は列の高さを揃える balance 挙動で大きな空白ができるため、
 * ここでは画像を「低い方の列」へ貪欲に振り分けて両列の高さを揃える方式にする。
 * これで縦横比を保ったまま、不自然な空白なくタイルが詰まる。
 *
 * ライトボックスはネイティブ <dialog>（フォーカストラップ・Esc閉じ標準対応）。
 * ←→キー・スワイプ・左右ボタンで前後の写真に移動できる。
 *
 * - reveal: スクロール表示アニメ（reveal-up）と段差ディレイ（トップの抜粋用）
 * - priorityCount: 先頭から何枚を priority 読み込みにするか（LCP対策）
 */
export function GalleryMasonry({
  images,
  className = "",
  reveal = false,
  priorityCount = 0,
}: {
  images: ImageAsset[];
  className?: string;
  reveal?: boolean;
  priorityCount?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);

  const viewable = images.map((img, i) => ({ img, i })).filter(({ img }) => img.src);

  function moveBy(step: number) {
    if (openIndex == null || viewable.length < 2) return;
    const pos = viewable.findIndex(({ i }) => i === openIndex);
    const next = viewable[(pos + step + viewable.length) % viewable.length];
    setOpenIndex(next.i);
  }

  // openIndex と <dialog> の開閉状態を同期する
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex != null && !dialog.open) dialog.showModal();
    if (openIndex == null && dialog.open) dialog.close();
  }, [openIndex]);

  // 開いている間は背景ページのスクロールをロック
  useEffect(() => {
    if (openIndex == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  // 高さの重み（縦=1.5 / 横=0.67）で、その時点で低い列へ追加していく。
  const columns: { img: ImageAsset; i: number }[][] = [[], []];
  const heights = [0, 0];
  images.forEach((img, i) => {
    const target = heights[0] <= heights[1] ? 0 : 1;
    columns[target].push({ img, i });
    heights[target] += img.orientation === "portrait" ? 1.5 : 0.67;
  });

  const current = openIndex != null ? images[openIndex] : null;
  const currentPos =
    openIndex != null ? viewable.findIndex(({ i }) => i === openIndex) : -1;

  return (
    <>
      <div className={`flex gap-3 sm:gap-4 ${className}`}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex w-1/2 flex-col gap-3 sm:gap-4">
            {col.map(({ img, i }) => (
              <figure
                key={img.src ?? i}
                className={`cosmic-panel relative w-full overflow-hidden rounded-xl ${
                  img.orientation === "portrait" ? "aspect-[2/3]" : "aspect-[3/2]"
                }${reveal ? ` reveal-up ${i % 3 === 1 ? "delay-100" : i % 3 === 2 ? "delay-200" : ""}` : ""}`}
              >
                <ImageSlot
                  asset={img}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  priority={i < priorityCount}
                />
                {img.src && (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`${img.alt}を拡大表示`}
                    className="absolute inset-0 cursor-zoom-in"
                  />
                )}
              </figure>
            ))}
          </div>
        ))}
      </div>

      {/* ライトボックス */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") moveBy(1);
          if (e.key === "ArrowLeft") moveBy(-1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
      >
        {current?.src && (
          <div
            className="relative flex h-full w-full flex-col"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const startX = touchStartX.current;
              touchStartX.current = null;
              if (startX == null) return;
              const delta = e.changedTouches[0].clientX - startX;
              if (Math.abs(delta) > 48) moveBy(delta < 0 ? 1 : -1);
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="拡大表示を閉じる"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white transition-colors hover:border-teal-200/60"
            >
              ×
            </button>

            {/* クリックが画像・ボタン以外（余白）なら閉じる */}
            <div
              className="relative flex-1"
              onClick={(e) => {
                if (e.target === e.currentTarget) setOpenIndex(null);
              }}
            >
              <div className="pointer-events-none absolute inset-4 sm:inset-10">
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </div>

            {viewable.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => moveBy(-1)}
                  aria-label="前の写真"
                  className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl transition-colors hover:border-teal-200/60 sm:left-4"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => moveBy(1)}
                  aria-label="次の写真"
                  className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl transition-colors hover:border-teal-200/60 sm:right-4"
                >
                  ›
                </button>
              </>
            )}

            <div className="pointer-events-none z-10 bg-gradient-to-t from-black/80 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 text-center">
              <p className="text-sm text-zinc-200">{current.alt}</p>
              {viewable.length > 1 && (
                <p className="mt-1 text-xs font-semibold text-zinc-400">
                  {currentPos + 1} / {viewable.length}
                </p>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
