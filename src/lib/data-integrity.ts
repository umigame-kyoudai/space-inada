import { getPlans, type PlanSlug } from "@/data/plans";
import { getPosts } from "@/data/posts";
import { testimonials } from "@/data/testimonials";
import { galleryImages } from "@/data/images";
import { coupons, normalizeCode } from "@/data/coupons";

/**
 * データ品質の自動チェック。
 *
 * sitemap 生成時（= ビルド時）に実行され、問題があればビルドを失敗させる。
 * 記事やプランを増やしてもデータの不整合（slug重複・参照切れ・必須欠落など）を
 * 自動で検出できるようにするのが目的。
 *
 * 依存を増やさず `npm run build` のワークフローに統合している。
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: string): boolean {
  return DATE_RE.test(s) && !Number.isNaN(Date.parse(s));
}

/** 問題点の配列を返す（空なら健全）。 */
export function validateData(): string[] {
  const errors: string[] = [];
  const plans = getPlans();
  const posts = getPosts();
  const planSlugs = new Set<PlanSlug>(plans.map((p) => p.slug));

  // ── プラン ──
  if (plans.length === 0) errors.push("plans: プランが0件です");
  const seenPlan = new Set<string>();
  for (const p of plans) {
    const at = `plans/${p.slug}`;
    if (!SLUG_RE.test(p.slug)) errors.push(`${at}: slug がURLに使えない形式です`);
    if (seenPlan.has(p.slug)) errors.push(`${at}: slug が重複しています`);
    seenPlan.add(p.slug);
    if (!p.name) errors.push(`${at}: name が空です`);
    if (!p.seo?.title) errors.push(`${at}: seo.title が空です`);
    if (!p.seo?.description) errors.push(`${at}: seo.description が空です`);
    if (p.priceFrom !== undefined && !(p.priceFrom > 0))
      errors.push(`${at}: priceFrom が不正です`);
    if (p.pricingDetail.length === 0)
      errors.push(`${at}: pricingDetail が空です`);
    if (p.keywords.length === 0) errors.push(`${at}: keywords が空です`);
    if (!isValidDate(p.updatedAt)) errors.push(`${at}: updatedAt が不正な日付です`);
  }

  // ── 記事 ──
  if (posts.length === 0) errors.push("posts: 記事が0件です");
  const seenPost = new Set<string>();
  for (const post of posts) {
    const at = `posts/${post.slug}`;
    if (!SLUG_RE.test(post.slug)) errors.push(`${at}: slug がURLに使えない形式です`);
    if (seenPost.has(post.slug)) errors.push(`${at}: slug が重複しています`);
    seenPost.add(post.slug);
    if (!post.title) errors.push(`${at}: title が空です`);
    if (!post.excerpt) errors.push(`${at}: excerpt が空です`);
    if (!post.seo?.title) errors.push(`${at}: seo.title が空です`);
    if (!post.seo?.description) errors.push(`${at}: seo.description が空です`);
    if (post.keywords.length === 0) errors.push(`${at}: keywords が空です`);
    if (!isValidDate(post.publishedAt))
      errors.push(`${at}: publishedAt が不正な日付です`);
    if (!isValidDate(post.updatedAt))
      errors.push(`${at}: updatedAt が不正な日付です`);
    // 関連プランの参照切れ
    for (const slug of post.relatedPlans) {
      if (!planSlugs.has(slug))
        errors.push(`${at}: relatedPlans の "${slug}" は存在しないプランです`);
    }
    // HowTo
    if (post.howTo) {
      if (!post.howTo.name) errors.push(`${at}: howTo.name が空です`);
      if (post.howTo.steps.length === 0)
        errors.push(`${at}: howTo.steps が空です`);
      post.howTo.steps.forEach((s, i) => {
        if (!s.name || !s.text)
          errors.push(`${at}: howTo.steps[${i}] の name/text が空です`);
      });
    }
  }

  // ── お客様の声 ──
  for (const [i, t] of testimonials.entries()) {
    const at = `testimonials[${i}]`;
    if (!(t.rating >= 1 && t.rating <= 5))
      errors.push(`${at}: rating は1〜5の範囲にしてください`);
    if (!planSlugs.has(t.plan))
      errors.push(`${at}: plan "${t.plan}" は存在しないプランです`);
    if (!isValidDate(t.date)) errors.push(`${at}: date が不正な日付です`);
    if (!t.body) errors.push(`${at}: body が空です`);
  }

  // ── 画像 alt ──
  galleryImages.forEach((img, i) => {
    if (!img.alt) errors.push(`galleryImages[${i}]: alt が空です`);
  });

  // ── クーポン ──
  const seenCoupon = new Set<string>();
  for (const c of coupons) {
    const at = `coupons/${c.code || "(空)"}`;
    if (!c.code) errors.push(`${at}: code が空です`);
    const key = normalizeCode(c.code);
    if (key && seenCoupon.has(key))
      errors.push(`${at}: code が重複しています（正規化後）`);
    seenCoupon.add(key);
    if (!c.label) errors.push(`${at}: label が空です`);
    const d = c.discount;
    if (d.kind === "percent") {
      if (!(d.rate > 0 && d.rate <= 100))
        errors.push(`${at}: discount.rate は0〜100の範囲にしてください`);
    } else if (!(d.amount > 0)) {
      errors.push(`${at}: discount.amount が不正です`);
    }
  }

  return errors;
}

/** 問題があれば例外を投げる（ビルド失敗させる）。 */
export function assertDataIntegrity(): void {
  const errors = validateData();
  if (errors.length > 0) {
    throw new Error(
      `データ整合性チェックに失敗しました（${errors.length}件）:\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
  }
}
