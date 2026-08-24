/** 紹介リンクの有効期間（First Touchから30日間）。 */
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** ブラウザに保存する紹介コードのCookie名。 */
export const REFERRAL_COOKIE_NAME = "space_inada_referral";

/**
 * 紹介スタッフのマスター。
 * スタッフ追加時はここへ紹介コードと表示名を追加する。
 */
export const REFERRAL_STAFF_BY_CODE = {
  sho: { code: "sho", name: "Sho" },
} as const;

export type ReferralStaff =
  (typeof REFERRAL_STAFF_BY_CODE)[keyof typeof REFERRAL_STAFF_BY_CODE];

/** 登録済みの紹介コードだけをスタッフ情報へ変換する。 */
export function getReferralStaff(code: string | null | undefined): ReferralStaff | null {
  if (!code || !Object.prototype.hasOwnProperty.call(REFERRAL_STAFF_BY_CODE, code)) {
    return null;
  }
  return REFERRAL_STAFF_BY_CODE[code as keyof typeof REFERRAL_STAFF_BY_CODE];
}

/** document.cookie形式の文字列から、有効な紹介スタッフを取得する。 */
export function getReferralStaffFromCookieString(cookieString: string): ReferralStaff | null {
  const cookie = cookieString
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${REFERRAL_COOKIE_NAME}=`));

  if (!cookie) return null;

  const encodedValue = cookie.slice(REFERRAL_COOKIE_NAME.length + 1);
  try {
    return getReferralStaff(decodeURIComponent(encodedValue));
  } catch {
    return null;
  }
}

/** LINE予約文章へ追記する内部管理用ラベル。 */
export function formatReferralMessageLines(referral: ReferralStaff): string {
  return `紹介スタッフ：${referral.name}\n紹介コード：${referral.code}`;
}
