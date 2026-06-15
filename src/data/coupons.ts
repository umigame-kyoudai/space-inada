/**
 * クーポン定義 = 単一の真実。
 * 予約フォーム（/booking）のクーポン照合・割引計算がこの配列を参照する。
 *
 * 注意：本サイトはバックエンドを持たず、判定はクライアント側で行う。
 * そのためコードは公開バンドルに含まれ「誰でも閲覧可能」。オンライン決済はなく
 * 最終金額はスタッフがLINEで確定する運用のため、マーケ／概算提示の利便機能として用いる。
 * 秘匿コードや1回限り使用が必要になった時点でバックエンドが必須になる。
 */

import { formatPrice } from "@/data/plans";

/** 割引の種類。perPerson=1人ごと定額 / fixed=合計から定額 / percent=合計の割合 */
export type CouponDiscount =
  | { kind: "perPerson"; amount: number } // ¥amount × 人数
  | { kind: "fixed"; amount: number } // 合計から ¥amount
  | { kind: "percent"; rate: number }; // 合計の rate%

export type Coupon = {
  /** 入力照合用の正規コード（例: "カメハメハ"） */
  code: string;
  /** 表示名（例: "カメハメハ｜一人 ¥1,000 オフ"） */
  label: string;
  discount: CouponDiscount;
};

export const coupons: Coupon[] = [
  {
    code: "カメハメハ",
    label: "カメハメハ｜一人 ¥1,000 オフ",
    discount: { kind: "perPerson", amount: 1000 },
  },
];

/**
 * 照合用にコードを正規化する。
 * 前後空白・全角半角・大小文字の揺れを吸収する（NFKCで全角/半角カナも統一）。
 */
export function normalizeCode(s: string): string {
  return s.trim().normalize("NFKC").toLowerCase();
}

/** 入力文字列に一致するクーポンを返す（なければ undefined）。 */
export function findCoupon(input: string): Coupon | undefined {
  const key = normalizeCode(input);
  if (!key) return undefined;
  return coupons.find((c) => normalizeCode(c.code) === key);
}

/**
 * 割引額を算出する。
 * 合計がマイナスにならないよう 0〜subtotal の範囲にクランプする。
 */
export function computeCouponDiscount(
  coupon: Coupon,
  { subtotal, headcount }: { subtotal: number; headcount: number },
): number {
  const { discount } = coupon;
  let raw = 0;
  if (discount.kind === "perPerson") {
    raw = discount.amount * Math.max(0, headcount);
  } else if (discount.kind === "fixed") {
    raw = discount.amount;
  } else {
    raw = Math.round((subtotal * discount.rate) / 100);
  }
  return Math.max(0, Math.min(raw, subtotal));
}

/** メッセージ／UI表示用の割引テキスト（例: "カメハメハ（-¥3,000）"）。 */
export function formatCouponDiscount(coupon: Coupon, discount: number): string {
  return `${coupon.code}（-${formatPrice(discount)}）`;
}

export function getCoupons(): Coupon[] {
  return coupons;
}
