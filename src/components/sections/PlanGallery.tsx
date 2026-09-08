import { ImageSlot } from "@/components/media/ImageSlot";
import type { ImageAsset } from "@/data/images";

/**
 * プランの写真ギャラリー。
 * - 1枚 → 16:9 で単独表示
 * - 複数枚 → 横スワイプのスライダー（CSS scroll-snap のみ・モバイル最適）
 */
export function PlanGallery({
  images,
  priority = false,
}: {
  images: ImageAsset[];
  priority?: boolean;
}) {
  if (images.length <= 1) {
    return (
      <div className="cosmic-panel relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <ImageSlot asset={images[0]} priority={priority} sizes="(max-width: 1024px) 100vw, 1024px" />
      </div>
    );
  }

  return (
    <div
      aria-label="撮影イメージ"
      tabIndex={0}
      className="-mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {images.map((img, i) => (
        <figure
          key={img.src ?? i}
          className="cosmic-panel relative aspect-[16/9] w-[88%] shrink-0 snap-center overflow-hidden rounded-xl sm:w-[60%]"
        >
          <ImageSlot
            asset={img}
            priority={priority && i === 0}
            sizes="(max-width: 1024px) 88vw, 620px"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-0.5 text-xs font-semibold text-on-photo backdrop-blur">
            {i + 1} / {images.length}
          </span>
        </figure>
      ))}
    </div>
  );
}
