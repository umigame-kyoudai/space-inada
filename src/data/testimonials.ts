import type { PlanSlug } from "./plans";

/**
 * お客様の声 = 単一の真実。/voice 表示と Review 構造化データが参照する。
 *
 * ⚠️ 実際にいただいた本物の声・評価のみを掲載すること。
 *   架空のレビュー・評価の公開は景品表示法および Google のポリシー違反となり、
 *   検索順位へのペナルティにつながる可能性がある。
 *   （2026-07-08: 根拠のないサンプル10件と表示用の累計クチコミ数・平均評価を削除）
 *
 * ── 本物の声を掲載する手順 ──────────────────────────────
 * 下の配列に次の形式で追加するだけで、トップの「お客様の声」セクション・
 * /voice ページ・sitemap が自動で有効化される（コード変更は不要）:
 *
 *   {
 *     name: "Y・M 様",            // 表示名（イニシャル・ニックネーム可）
 *     area: "東京都／カップル",    // 居住地・属性など
 *     plan: "standard",           // 体験したプラン（plans.ts の slug）
 *     rating: 5,                  // 実際にいただいた評価（1〜5）
 *     date: "2026-07-01",         // 撮影/投稿日（YYYY-MM-DD）
 *     body: "感想の本文…",
 *   },
 *
 * さらに検索結果に★評価（Review 構造化データ）を出す場合は、
 * Vercel に NEXT_PUBLIC_ENABLE_REVIEW_SCHEMA=true を設定して再デプロイする。
 * ─────────────────────────────────────────────
 */
export type Testimonial = {
  /** 表示名（イニシャルやニックネーム可） */
  name: string;
  /** 居住地・属性など */
  area: string;
  /** 体験したプラン */
  plan: PlanSlug;
  /** 5段階評価 */
  rating: number;
  /** 撮影/投稿日 */
  date: string;
  body: string;
};

/** 実際にいただいた声のみを追加すること（上のテンプレ参照） */
export const testimonials: Testimonial[] = [];

export function getTestimonials(): Testimonial[] {
  return [...testimonials].sort((a, b) => b.date.localeCompare(a.date));
}

/** 平均評価（小数第1位）。構造化データ（AggregateRating）はこの実値のみを使う。 */
export function getAverageRating(): number {
  if (testimonials.length === 0) return 0;
  const sum = testimonials.reduce((acc, t) => acc + t.rating, 0);
  return Math.round((sum / testimonials.length) * 10) / 10;
}
