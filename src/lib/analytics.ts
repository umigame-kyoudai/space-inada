/**
 * 計測（Google Analytics 4）の共通ユーティリティ。
 *
 * 計測IDは環境変数 NEXT_PUBLIC_GA_MEASUREMENT_ID（例: G-XXXXXXXXXX）で設定する。
 * 次のいずれかでは GA を読み込まず、イベントも送信しない（開発・プレビューの誤計測防止）:
 * - 測定IDが未設定
 * - 開発ビルド（next dev）
 * - Vercel のプレビュー環境（NEXT_PUBLIC_VERCEL_ENV が production 以外）
 * - localhost / 127.0.0.1 での閲覧（next start 等）
 *
 * 個人情報（氏名・電話番号・メールアドレス・フォーム入力内容）は
 * イベントパラメータに絶対に含めないこと。
 */

import { getReferralStaffFromCookieString } from "@/lib/referrals";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/** この環境で GA4 に送信してよいか（クライアントでのみ true になり得る） */
export function isGaEnabled(): boolean {
  if (!GA_MEASUREMENT_ID) return false;
  if (process.env.NODE_ENV !== "production") return false;
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") return false;
  if (typeof window === "undefined") return false;
  return !LOCAL_HOSTNAMES.has(window.location.hostname);
}

/**
 * gtag.js と同形式で dataLayer へ積む。gtag.js は配列ではなく Arguments
 * オブジェクトを要求するため、rest 引数ではなく arguments をそのまま push する。
 * gtag.js のロード完了前でもキューされ、ロード後にまとめて処理される。
 */
export const gaPush: (...args: unknown[]) => void = function () {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
};

/**
 * 任意のイベントを GA4 に送信する（無効な環境では何もしない）。
 * page_path / page_title は自動で付与する。
 */
export function trackEvent(
  action: string,
  params: Record<string, unknown> = {},
): void {
  if (!isGaEnabled()) return;
  const referralStaff = getReferralStaffFromCookieString(document.cookie);
  gaPush("event", action, {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
    ...params,
    ...(referralStaff ? { referral_staff: referralStaff.code } : {}),
  });
}
