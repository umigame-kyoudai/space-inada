import type { Plan, PlanSlug } from "./plans";
import type { Post } from "./posts";

/**
 * サイト全体の画像スロットを一元管理する。
 *
 * 【写真を後から入れる手順】
 *  1. 画像ファイルを public/images/... に置く（推奨パスは各定義のコメント参照）
 *  2. 該当スロットの `src` のコメントを外す／パスを設定する
 *  → それだけで自動的にプレースホルダーから実写真へ切り替わる（レイアウトは確保済みなので崩れない）。
 *
 * `src` が未設定のスロットは、テーマに合うプレースホルダーが表示される。
 */
export type ImageAsset = {
  /** /images/... のパス。未設定ならプレースホルダー表示 */
  src?: string;
  /** alt テキスト（SEO・アクセシビリティ用。実写真未設定でも先に用意しておく） */
  alt: string;
  /** 写真の向き。ギャラリー（マソンリー）で縦/横をそのまま活かすために使う。未指定は landscape 扱い */
  orientation?: "portrait" | "landscape";
};

/* ───────────── トップ ヒーロー ───────────── */
export const heroImage: ImageAsset = {
  // src: "/images/hero/hero.jpg", // 推奨: 横長 1920×1080 以上
  alt: "宮古島の満天の星空と天の川を背景にしたカップルの星空フォト",
};

/* ───────────── プラン（slug別） ───────────── */
// 各プランに写真を「複数枚」設定できる（配列の順番に表示される）。
// 写真が用意できたら該当行のコメントを外す（推奨: 1200×900 程度）。
const PLAN_IMAGE_SRC: Partial<Record<PlanSlug, string[]>> = {
  // プランのスロットは 4:3 / 16:9 の横長レイアウト。崩れないよう「横写真」のみを使う。
  casual: [
    "/images/plans/standard-31-couple-facing-milkyway-silhouette.jpg",
    "/images/plans/standard-35-couple-seawall-milkyway-diagonal.jpg",
    "/images/plans/standard-26-couple-pointing-milkyway-arch.jpg",
    "/images/plans/standard-01-couple-back-to-back-milkyway.jpg",
  ],
  standard: [
    "/images/plans/standard-44-couple-facing-handhold-moon.jpg",
    "/images/plans/standard-09-couple-handhold-facing-milkyway.jpg",
    "/images/plans/standard-13-couple-deck-milkyway-arch.jpg",
    "/images/plans/standard-46-couple-lookup-milkyway-center.jpg",
  ],
  family: [
    "/images/plans/family-01-shoulder-ride-milkyway.jpg",
    "/images/plans/family-14-pointing-light-milkyway.jpg",
    "/images/plans/family-07-grass-sitting-lookup-milkyway.jpg",
    "/images/plans/family-04-hilltop-silhouette-milkyway.jpg",
  ],
  creative: [
    "/images/plans/creative-03-illumination-proposal-fairylights.jpg",
    "/images/plans/creative-05-illumination-couple-foreheads.jpg",
    "/images/plans/creative-06-illumination-light-up-milkyway.jpg",
    "/images/plans/creative-04-illumination-sparkler-deck.jpg",
  ],
  propose: [
    "/images/plans/propose-03-milkyway-kneeling-moonrise.jpg",
    "/images/plans/propose-04-milkyway-kneeling-ridge.jpg",
    "/images/plans/propose-08-milkyway-grasshill-couple.jpg",
    "/images/plans/propose-09-milkyway-grasshill-facing.jpg",
  ],
  // 看板プラン（近日公開）。スペースシャトルの世界観をカバーに。
  "space-inada": [
    "/images/plans/space-inada-shuttle.jpg",
    "/images/gallery/standard-30-milkyway-landscape-nopeople.jpg",
  ],
};

/** プランの写真をすべて返す（未設定ならプレースホルダー1枚）。 */
export function planImages(plan: Plan): ImageAsset[] {
  const srcs = PLAN_IMAGE_SRC[plan.slug] ?? [];
  if (srcs.length === 0) {
    return [{ alt: `${plan.name}｜宮古島の星空フォト撮影イメージ` }];
  }
  return srcs.map((src, i) => ({
    src,
    alt:
      srcs.length > 1
        ? `${plan.name}｜宮古島の星空フォト撮影イメージ（${i + 1}/${srcs.length}）`
        : `${plan.name}｜宮古島の星空フォト撮影イメージ`,
  }));
}

/** カードのサムネ用に先頭の1枚を返す。 */
export function planImage(plan: Plan): ImageAsset {
  return planImages(plan)[0];
}

/* ───────────── ブログ（slug別カバー） ───────────── */
// 推奨: 横長 1600×900
const POST_IMAGE_SRC: Record<string, string> = {
  "miyakojima-stargazing-spots":
    "/images/blog/miyakojima-stargazing-spots.jpg",
  "miyakojima-starry-sky-season":
    "/images/blog/miyakojima-starry-sky-season.jpg",
  "milky-way-miyakojima": "/images/blog/milky-way-miyakojima.jpg",
  "propose-photo-miyakojima":
    "/images/blog/propose-photo-miyakojima.jpg",
  "night-sightseeing-miyakojima":
    "/images/blog/night-sightseeing-miyakojima.jpg",
  "family-photo-miyakojima":
    "/images/blog/family-photo-miyakojima.jpg",
  "couple-photo-spot-miyakojima":
    "/images/blog/couple-photo-spot-miyakojima.jpg",
  "anniversary-photo-miyakojima":
    "/images/blog/anniversary-photo-miyakojima.jpg",
  "rain-weather-policy-miyakojima":
    "/images/blog/rain-weather-policy-miyakojima.jpg",
};

export function postImage(post: Post): ImageAsset {
  return {
    src: POST_IMAGE_SRC[post.slug],
    alt: post.title,
  };
}

/* ───────────── 動画（撮影の様子） ───────────── */
export type VideoAsset = {
  /** /videos/... のパス。未設定なら表示しない */
  src?: string;
  /** ポスター画像（任意。未設定でも可） */
  poster?: string;
  /** スクリーンリーダー/SEO 用の説明 */
  label: string;
};

export const shootingVideo: VideoAsset = {
  src: "/videos/shooting.mp4",
  poster: "/images/video/shooting-poster.jpg",
  label: "宮古島の星空のもとでの撮影の様子",
};

export const proposalBookingVideo: VideoAsset = {
  src: "/videos/proposal-booking-flow.mp4",
  poster: "/images/video/proposal-booking-flow-poster.jpg",
  label: "プロポーズ撮影の予約フォームから公式LINEへ相談する流れ",
};

/* ───────────── About（代表・ストーリー・チーム） ───────────── */
export const aboutPortrait: ImageAsset = {
  src: "/images/about/inada-portrait.jpg",
  alt: "宮古島の星空写真家・代表 稲田圭市のポートレート",
  orientation: "portrait",
};
export const aboutAccident: ImageAsset = {
  src: "/images/about/accident-bikes.jpg",
  alt: "17歳の頃に乗っていた原付バイク（大阪・北条公園へ向かう夜）",
};
export const aboutHospital: ImageAsset = {
  src: "/images/about/hospital-bed.jpg",
  alt: "事故で首・腰・背骨など6箇所を骨折し入院していた当時の様子",
};
export const aboutMilkyway: ImageAsset = {
  src: "/images/about/miyako-milkyway.jpg",
  alt: "宮古島で見上げた、人生で一番きれいだった満天の星空と天の川",
  orientation: "portrait",
};
export const aboutShooting: ImageAsset = {
  src: "/images/about/shooting-night.jpg",
  alt: "三脚を立てて宮古島の星空を撮影する稲田圭市",
};
export const aboutBookCover: ImageAsset = {
  src: "/images/about/book-cover.jpg",
  alt: "稲田圭市が掲載された星空書籍『LIFE CHANGING 人生を変える星空体験』",
};
export const aboutBookTalk: ImageAsset = {
  src: "/images/about/book-talk.jpg",
  alt: "星空案内人 NOBBY池田と星空写真家 稲田圭市の対談ページ",
};
export const aboutBookSpread: ImageAsset = {
  src: "/images/about/book-spread.jpg",
  alt: "「来間島の星空への想い」を綴った書籍の見開きページ",
};
/** sitemap 互換のため維持（撮影シーンに統合） */
export const aboutActivity: ImageAsset = aboutShooting;

/* ───────────── ギャラリー（作品集 / 画像検索狙い） ───────────── */
// 写真を追加するときは src を設定（alt は検索キーワードを意識して記述済み）。
// ギャラリーは縦・横の両方をそのまま活かす（マソンリー表示）。各写真に向きを指定する。
export const galleryImages: ImageAsset[] = [
  { src: "/images/gallery/standard-30-milkyway-landscape-nopeople.jpg", orientation: "landscape", alt: "宮古島の天の川と星空フォト" },
  { src: "/images/plans/propose-07-milkyway-reflection-embrace.jpg", orientation: "portrait", alt: "宮古島でプロポーズ撮影をするカップルの星空フォト" },
  { src: "/images/plans/family-01-shoulder-ride-milkyway.jpg", orientation: "landscape", alt: "宮古島の星空を背景にした家族写真" },
  { src: "/images/plans/standard-44-couple-facing-handhold-moon.jpg", orientation: "landscape", alt: "宮古島の記念日カップルフォト" },
  { src: "/images/gallery/standard-39-man-beach-milkyway-sea.jpg", orientation: "portrait", alt: "宮古島のビーチで撮影した星空ポートレート" },
  { src: "/images/gallery/standard-49-woman-beach-reach-milkyway.jpg", orientation: "portrait", alt: "宮古島の夜空に広がる満天の星" },
  { src: "/images/plans/standard-57-couple-deck-back-milkyway.jpg", orientation: "portrait", alt: "宮古島ロケーション撮影の星空ツアーの一枚" },
  { src: "/images/plans/creative-01-illumination-fairylights-couple.jpg", orientation: "portrait", alt: "宮古島の星空とイルミネーションを活かしたクリエイティブフォト" },
  { src: "/images/plans/standard-33-couple-grass-facing-milkyway.jpg", orientation: "portrait", alt: "宮古島でカジュアルプランのカップル星空フォト" },
];
