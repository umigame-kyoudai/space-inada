import { type NextRequest, NextResponse } from "next/server";
import {
  getReferralStaff,
  REFERRAL_COOKIE_MAX_AGE_SECONDS,
  REFERRAL_COOKIE_NAME,
} from "@/lib/referrals";

/**
 * 有効な紹介リンクのFirst Touchだけを30日Cookieへ保存する。
 * 既存の有効な紹介コードがある場合はCookieを再設定せず、期限も延長しない。
 */
export function proxy(request: NextRequest) {
  const incomingReferral = getReferralStaff(request.nextUrl.searchParams.get("ref"));
  const storedReferral = getReferralStaff(request.cookies.get(REFERRAL_COOKIE_NAME)?.value);

  if (!incomingReferral || storedReferral) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set({
    name: REFERRAL_COOKIE_NAME,
    value: incomingReferral.code,
    maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    priority: "medium",
  });
  return response;
}

/** 紹介パラメータがあるページリクエストだけを対象にする。 */
export const config = {
  matcher: [
    {
      source: "/:path*",
      has: [{ type: "query", key: "ref" }],
    },
  ],
};
