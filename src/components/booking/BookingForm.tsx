"use client";

import Link from "next/link";
import { type Ref, useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  DELIVERY_TIME_LABEL,
  formatPrice,
  LATE_NIGHT_FEES,
  type PlanPriceKind,
} from "@/data/plans";
import { findCoupon, computeCouponDiscount, formatCouponDiscount } from "@/data/coupons";
import { teamMembers } from "@/data/team";
import {
  AVAILABILITY_YEAR,
  getTodayInJapanDateKey,
  isFullMoonClosureDate,
} from "@/data/availability";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import type { Locale } from "@/lib/i18n/locales";
import { formatTemplate } from "@/lib/i18n/format";
import {
  formatReferralMessageLines,
  getReferralStaffFromCookieString,
  type ReferralStaff,
} from "@/lib/referrals";

/** 公式LINE（予約相談） */
const LINE_URL = "https://lin.ee/5z6HX4S";

/** 入力内容の自動保存キー（離脱しても復元する） */
const STORAGE_KEY = "booking-form-v2";

type PlanOption = {
  slug: string;
  /** 送信文・GAS解析用の値。常に日本語のプラン名（変更しないこと） */
  name: string;
  /** 画面表示用のラベル。翻訳ページでは翻訳名、未指定なら name を表示 */
  label?: string;
  kind: PlanPriceKind;
  /** /人 なら大人1名の料金、/組 なら1組の料金。要見積りは null */
  basePrice: number | null;
  /** 子供（0〜15才）料金。/人 プランのみ */
  childPrice: number | null;
  /** 1組料金に含まれる最大参加人数。上限なしは null */
  maxParticipants: number | null;
};

type Props = {
  planOptions: PlanOption[];
  defaultPlan?: string;
  /** 送迎オプションの料金 */
  pickupPrice: number;
  /** スタッフ指名料 */
  staffNominationPrice: number;
  /** CV計測用の流入元（?from= の値。hero / header / floating / cta など） */
  from?: string;
  /** 翻訳ページ用の表示文言（辞書全体）。未指定なら日本語（既定の挙動と完全に同じ）。
      ※ LINE送信文（buildMessage）は常に日本語フォーマットのまま変えない
        （スタッフ側の予約管理ツールが日本語ラベルで自動解析するため）。 */
  dict?: Dictionary;
  /** 翻訳ページのロケール（アクセスページ等への内部リンク生成に使用） */
  locale?: Locale;
};

type PreferredTimeWindow =
  | ""
  | "19:00〜22:00"
  | "22:00〜24:00"
  | "24:00〜翌4:00";

const PREFERRED_TIME_WINDOWS = [
  {
    value: "19:00〜22:00",
    label: "19:00〜22:00",
    note: "夏季は早くても21:00頃のスタートです",
  },
  {
    value: "22:00〜24:00",
    label: "22:00〜24:00",
    note: "夜の遅めの時間帯を希望する方",
  },
  {
    value: "24:00〜翌4:00",
    label: "24:00〜翌4:00",
    note: "深夜料金がかかります",
  },
] as const satisfies ReadonlyArray<{
  value: Exclude<PreferredTimeWindow, "">;
  label: string;
  note: string;
}>;

function formatDate(v: string): string {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  if (!y || !m || !d) return v;
  return `${y}/${m}/${d}`;
}

function formatInstagram(v: string): string {
  const trimmed = v.trim().replace(/^@+/, "");
  return trimmed ? `@${trimmed}` : "";
}

/**
 * LINE送信用テキストを組み立てる。
 * 人数・オプション・お会計（概算）・お支払い方法（現地現金のみ）まで含める。
 */
function buildMessage(v: {
  date: string;
  preferredTimeWindow: PreferredTimeWindow;
  plan: string;
  name: string;
  adults: number;
  children: number;
  adultMale: number;
  adultFemale: number;
  childMale: number;
  childFemale: number;
  phone: string;
  hotel: string;
  stay: string;
  pickup: boolean;
  pickupPrice: number;
  staffName: string;
  staffNominationPrice: number;
  lateNightConsent: boolean;
  instagram: string;
  story: boolean;
  totalText: string;
  couponText: string;
  referralStaff: ReferralStaff | null;
}): string {
  const staffNominationText = !v.staffName
    ? "なし（おまかせ）"
    : v.staffName === "稲田"
      ? `稲田（+${formatPrice(v.staffNominationPrice)}）`
      : `${v.staffName}（指名料¥0）`;

  return `【KEY PHOTO 宮古島 ご予約・お問い合わせ】

① 撮影希望日：
${formatDate(v.date)}
希望時間帯：${v.preferredTimeWindow}

② 希望プラン：
${v.plan}

③ お名前：
${v.name}

④ 人数：
大人：${v.adults}人
子ども（0〜15才）：${v.children}人
参加者の性別内訳：大人（男性${v.adultMale}人・女性${v.adultFemale}人）／子ども（男の子${v.childMale}人・女の子${v.childFemale}人）

⑤ 携帯番号：
${v.phone}

⑥ 宿泊施設名：
${v.hotel}

⑦ 滞在期間：
${v.stay}

⑧ オプション：
送迎：${v.pickup ? `希望する（+${formatPrice(v.pickupPrice)}）` : "なし"}
カメラマン指名：${staffNominationText}
深夜料金：${v.lateNightConsent ? `0:00〜0:59は+${formatPrice(LATE_NIGHT_FEES.midnight)}/人、1:00以降は+${formatPrice(LATE_NIGHT_FEES.afterOne)}/人を了承済み` : "未確認"}

⑨ Instagram（任意）：
${formatInstagram(v.instagram)}
ストーリータグ付け：${v.story ? "OK" : "未回答"}

━━━━━━━━━━━━━━━━
💴 お会計（概算）：
${v.totalText}${v.couponText ? `\n🎟 クーポン：${v.couponText}` : ""}
※お支払いは「現地にて現金決済のみ」となります。
（最終金額はLINEにてご確定します）
※深夜料金は上記の概算に含まれていません。撮影時間の確定後、必要な場合は加算します。
📷 納品：${DELIVERY_TIME_LABEL}（オンライン）
━━━━━━━━━━━━━━━━
【送信後のご案内】
内容を確認後、24時間以内にスタッフからLINEでご連絡します。
ご希望日の月齢や星の位置を事前に確認し、最適な撮影時間をご提案します。
集合場所は、その日の雲や風などの星空コンディションを確認したうえで、当日にご案内します。
${v.referralStaff ? `
${formatReferralMessageLines(v.referralStaff)}` : ""}
━━━━━━━━━━━━━━━━`;
}

const inputClass =
  "min-w-0 w-full max-w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm";

function RequiredBadge({ label = "必須" }: { label?: string }) {
  return (
    <span className="ml-2 rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
      {label}
    </span>
  );
}

function ParticipantNumberInput({
  id,
  label,
  unit = "人",
  value,
  onChange,
  inputRef,
  describedBy,
  invalid = false,
}: {
  id: string;
  label: string;
  /** 入力欄右端の単位表示。翻訳ページでは空文字にして数字だけにする */
  unit?: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  describedBy: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="number"
          min={0}
          max={10}
          step={1}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`${inputClass} pr-10`}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function BookingForm({
  planOptions,
  defaultPlan,
  pickupPrice,
  staffNominationPrice,
  from,
  dict,
  locale,
}: Props) {
  const t = dict?.booking;
  const requiredText = dict?.common.required ?? "必須";
  const accessHref = locale ? `/${locale}/access#shooting-locations` : "/access#shooting-locations";
  const inadaNominationOption = dict?.planOptionOverlay.nomination.detail[0];
  const defaultPlanName =
    planOptions.find((p) => p.slug === defaultPlan)?.name ?? "";

  const [date, setDate] = useState("");
  const [preferredTimeWindow, setPreferredTimeWindow] =
    useState<PreferredTimeWindow>("");
  const [plan, setPlan] = useState(defaultPlanName);
  const [name, setName] = useState("");
  const [adultMale, setAdultMale] = useState("0");
  const [adultFemale, setAdultFemale] = useState("0");
  const [childMale, setChildMale] = useState("0");
  const [childFemale, setChildFemale] = useState("0");
  const [phone, setPhone] = useState("");
  const [hotel, setHotel] = useState("");
  const [stay, setStay] = useState("");
  const [pickup, setPickup] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [lateNightConsent, setLateNightConsent] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [story, setStory] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [referralStaff, setReferralStaff] = useState<ReferralStaff | null>(null);
  // コピー／コピー失敗の操作対象だったメッセージ。現在のメッセージと違えば「古い」状態とみなす。
  const [actedMessage, setActedMessage] = useState("");

  // Proxyが保存したFirst Touchの紹介コードを、ハイドレーション後にCookieから復元する。
  useEffect(() => {
    const storedReferral = getReferralStaffFromCookieString(document.cookie);
    if (!storedReferral) return;
    // SSRと初回描画は紹介なしのままにし、ハイドレーション差異を避ける。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReferralStaff(storedReferral);
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const adultMaleRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLTextAreaElement>(null);
  // モバイル固定バーの出し分け用。本来のアクションボタンが見えている間はバーを隠す。
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsInView, setActionsInView] = useState(false);
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setActionsInView(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const todayDateKey = useMemo(() => getTodayInJapanDateKey(), []);
  const [availabilityMonthIndex, setAvailabilityMonthIndex] = useState(() =>
    Math.min(11, Math.max(0, Number(todayDateKey.slice(5, 7)) - 1)),
  );
  const isSelectedDateClosed = isFullMoonClosureDate(date);
  const adultMaleNum = Math.max(0, parseInt(adultMale, 10) || 0);
  const adultFemaleNum = Math.max(0, parseInt(adultFemale, 10) || 0);
  const childMaleNum = Math.max(0, parseInt(childMale, 10) || 0);
  const childFemaleNum = Math.max(0, parseInt(childFemale, 10) || 0);
  const adultsNum = adultMaleNum + adultFemaleNum;
  const childrenNum = childMaleNum + childFemaleNum;
  const participantCount = adultsNum + childrenNum;
  const participantCountComplete = participantCount > 0 && participantCount <= 10;
  const requiredItems = [
    {
      label: t ? t.dateLabel : "撮影希望日",
      complete: Boolean(date) && date >= todayDateKey && !isSelectedDateClosed,
    },
    { label: t ? t.timeWindowLabel : "希望時間帯", complete: Boolean(preferredTimeWindow) },
    { label: t ? t.planLabel : "希望プラン", complete: Boolean(plan) },
    { label: t ? t.nameLabel : "お名前", complete: Boolean(name.trim()) },
    { label: t ? t.participantsLabel : "参加人数・性別", complete: participantCountComplete },
    { label: t ? t.phoneLabel : "携帯番号", complete: Boolean(phone.trim()) },
    { label: t ? t.lateNightConsent : "深夜料金への同意", complete: lateNightConsent },
  ];
  const incompleteRequiredItems = requiredItems.filter((item) => !item.complete);
  const completedRequiredCount = requiredItems.length - incompleteRequiredItems.length;

  function selectDate(value: string) {
    setDate(value);
    const [year, month] = value.split("-").map(Number);
    if (year === AVAILABILITY_YEAR && month >= 1 && month <= 12) {
      setAvailabilityMonthIndex(month - 1);
    }
  }

  useEffect(() => {
    dateInputRef.current?.setCustomValidity(
      isSelectedDateClosed
        ? t
          ? t.dateClosedNotice
          : "この日は満月期間のため、星空フォトの撮影をお休みしています。別の日程をお選びください。"
        : "",
    );
  }, [isSelectedDateClosed, t]);

  useEffect(() => {
    const message =
      participantCount <= 0
        ? t
          ? t.participantsEmpty
          : "参加人数を1名以上入力してください。"
        : participantCount <= 10
          ? ""
          : t
            ? t.participantsOver
            : "参加人数は10名までです。11名以上の場合はLINEでご相談ください。";
    adultMaleRef.current?.setCustomValidity(message);
  }, [participantCount, t]);

  // CV計測: フォーム開始（最初のフィールド操作で1回だけ送る）
  const formStartedRef = useRef(false);
  function handleFormStart() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackEvent("form_start", {
      form_name: "booking",
      plan_name: plan || "未選択",
      from: from || "direct",
    });
  }

  // ───── お会計（概算）の計算 ─────
  const selectedPlan = planOptions.find((p) => p.name === plan);
  const pickupAmount = pickup ? pickupPrice : 0;
  const staffNominationAmount = staffName === "稲田" ? staffNominationPrice : 0;
  const exceedsParticipantLimit =
    selectedPlan?.maxParticipants != null &&
    participantCount > selectedPlan.maxParticipants;

  // 割引前の小計。quote（プロポーズ等）は null。
  const subtotal: number | null = useMemo(() => {
    if (!selectedPlan) return null;
    if (exceedsParticipantLimit) return null;
    if (selectedPlan.kind === "perPerson") {
      return (
        adultsNum * (selectedPlan.basePrice ?? 0) +
        childrenNum * (selectedPlan.childPrice ?? 0) +
        pickupAmount +
        staffNominationAmount
      );
    }
    if (selectedPlan.kind === "perGroup") {
      return (selectedPlan.basePrice ?? 0) + pickupAmount + staffNominationAmount;
    }
    return null; // quote（プロポーズ等）
  }, [
    selectedPlan,
    adultsNum,
    childrenNum,
    pickupAmount,
    staffNominationAmount,
    exceedsParticipantLimit,
  ]);

  // ───── クーポン ─────
  const coupon = useMemo(() => findCoupon(couponInput), [couponInput]);
  // 入力はあるがクーポンが見つからない＝無効
  const couponInvalid = couponInput.trim() !== "" && !coupon;
  // 小計が出る（＝概算が計算できる）プランでのみ割引を適用する
  const discountAmount = useMemo(() => {
    if (!coupon || subtotal == null) return 0;
    return computeCouponDiscount(coupon, {
      subtotal,
      headcount: adultsNum + childrenNum,
    });
  }, [coupon, subtotal, adultsNum, childrenNum]);

  // 割引後の最終合計。
  const total: number | null = subtotal == null ? null : subtotal - discountAmount;

  // 表示・送信用の合計テキスト
  const totalText = useMemo(() => {
    if (!plan) return "プランを選択すると概算が表示されます";
    if (exceedsParticipantLimit && selectedPlan?.maxParticipants != null) {
      return `${selectedPlan.maxParticipants + 1}名以上は別途お見積り（LINEでご相談ください）`;
    }
    if (total == null) return "別途お見積り（LINEでご相談ください）";
    return formatPrice(total);
  }, [plan, total, exceedsParticipantLimit, selectedPlan]);

  // 内訳行（UI表示用）
  const breakdown = useMemo(() => {
    const lines: string[] = [];
    if (selectedPlan?.kind === "perPerson") {
      lines.push(`大人 ${adultsNum}名 × ${formatPrice(selectedPlan.basePrice ?? 0)}`);
      if (childrenNum > 0) {
        lines.push(
          `子ども ${childrenNum}名 × ${formatPrice(selectedPlan.childPrice ?? 0)}`,
        );
      }
    } else if (selectedPlan?.kind === "perGroup" && !exceedsParticipantLimit) {
      lines.push(`${selectedPlan.name} 1組 ${formatPrice(selectedPlan.basePrice ?? 0)}`);
    }
    if (pickup) lines.push(`送迎 +${formatPrice(pickupPrice)}`);
    if (staffName === "稲田") {
      lines.push(`カメラマン指名 +${formatPrice(staffNominationPrice)}（稲田）`);
    } else if (staffName) {
      lines.push(`カメラマン指名 ¥0（${staffName}）`);
    }
    if (coupon && discountAmount > 0) {
      lines.push(`クーポン（${coupon.code}） -${formatPrice(discountAmount)}`);
    }
    return lines;
  }, [
    selectedPlan,
    adultsNum,
    childrenNum,
    exceedsParticipantLimit,
    pickup,
    pickupPrice,
    staffName,
    staffNominationPrice,
    coupon,
    discountAmount,
  ]);

  // LINEメッセージ用のクーポン記載テキスト。
  const couponText = useMemo(() => {
    if (!coupon) return "";
    if (discountAmount > 0) return formatCouponDiscount(coupon, discountAmount);
    // 見積りプラン等、概算が出ない場合はコードのみ記載（見積り時に適用）
    if (subtotal == null) return `${coupon.code}（お見積り時に適用）`;
    return "";
  }, [coupon, discountAmount, subtotal]);

  const message = useMemo(
    () =>
      buildMessage({
        date,
        preferredTimeWindow,
        plan,
        name,
        adults: adultsNum,
        children: childrenNum,
        adultMale: adultMaleNum,
        adultFemale: adultFemaleNum,
        childMale: childMaleNum,
        childFemale: childFemaleNum,
        phone,
        hotel,
        stay,
        pickup,
        pickupPrice,
        staffName,
        staffNominationPrice,
        lateNightConsent,
        instagram,
        story,
        totalText,
        couponText,
        referralStaff,
      }),
    [
      date,
      preferredTimeWindow,
      plan,
      name,
      adultsNum,
      childrenNum,
      adultMaleNum,
      adultFemaleNum,
      childMaleNum,
      childFemaleNum,
      phone,
      hotel,
      stay,
      pickup,
      pickupPrice,
      staffName,
      staffNominationPrice,
      lateNightConsent,
      instagram,
      story,
      totalText,
      couponText,
      referralStaff,
    ],
  );

  // 入力が変わったら（コピー後に編集したら）コピー状態は無効化する
  const effectiveStatus = actedMessage === message ? status : "idle";

  // localStorage から復元（マウント後に一度だけ。ハイドレーション不一致を避ける）
  const restoredRef = useRef(false);
  function applySaved(s: Record<string, unknown>) {
    if (typeof s.date === "string") selectDate(s.date);
    if (
      s.preferredTimeWindow === "19:00〜22:00" ||
      s.preferredTimeWindow === "22:00〜24:00" ||
      s.preferredTimeWindow === "24:00〜翌4:00"
    ) {
      setPreferredTimeWindow(s.preferredTimeWindow);
    }
    if (typeof s.plan === "string") setPlan(s.plan);
    if (typeof s.name === "string") setName(s.name);
    if (typeof s.adultMale === "string") setAdultMale(s.adultMale);
    if (typeof s.adultFemale === "string") setAdultFemale(s.adultFemale);
    if (typeof s.childMale === "string") setChildMale(s.childMale);
    if (typeof s.childFemale === "string") setChildFemale(s.childFemale);
    if (typeof s.phone === "string") setPhone(s.phone);
    if (typeof s.hotel === "string") setHotel(s.hotel);
    if (typeof s.stay === "string") setStay(s.stay);
    if (typeof s.pickup === "boolean") setPickup(s.pickup);
    if (typeof s.staffName === "string") {
      setStaffName(s.staffName);
    } else if (s.staffNomination === true) {
      // 旧形式の保存データは「稲田指名」として引き継ぐ。
      setStaffName("稲田");
    }
    if (typeof s.lateNightConsent === "boolean") {
      setLateNightConsent(s.lateNightConsent);
    }
    if (typeof s.instagram === "string") setInstagram(s.instagram);
    if (typeof s.story === "boolean") setStory(s.story);
    if (typeof s.coupon === "string") setCouponInput(s.coupon);
  }
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        // URLで明示的にプランが指定されていれば、そちらを優先
        if (defaultPlanName) saved.plan = defaultPlanName;
        // マウント後に一度だけ復元する正規パターン（SSRと初回描画はデフォルト値→ハイドレーション安全）
        // eslint-disable-next-line react-hooks/set-state-in-effect
        applySaved(saved);
      }
    } catch {
      // 破損データは無視
    }
    restoredRef.current = true;
    // 復元はマウント時の一度きり
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 入力変更を自動保存（復元完了後のみ）
  useEffect(() => {
    if (!restoredRef.current) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date,
          preferredTimeWindow,
          plan,
          name,
          adultMale,
          adultFemale,
          childMale,
          childFemale,
          phone,
          hotel,
          stay,
          pickup,
          staffName,
          lateNightConsent,
          instagram,
          story,
          coupon: couponInput,
        }),
      );
    } catch {
      // 保存できない環境では何もしない
    }
  }, [
    date,
    preferredTimeWindow,
    plan,
    name,
    adultMale,
    adultFemale,
    childMale,
    childFemale,
    phone,
    hotel,
    stay,
    pickup,
    staffName,
    lateNightConsent,
    instagram,
    story,
    couponInput,
  ]);

  function handleClear() {
    setDate("");
    setPreferredTimeWindow("");
    setPlan(defaultPlanName);
    setName("");
    setAdultMale("0");
    setAdultFemale("0");
    setChildMale("0");
    setChildFemale("0");
    setPhone("");
    setHotel("");
    setStay("");
    setPickup(false);
    setStaffName("");
    setLateNightConsent(false);
    setInstagram("");
    setStory(false);
    setCouponInput("");
    setStatus("idle");
    setActedMessage("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 何もしない
    }
  }

  function fallbackCopy(): boolean {
    const ta = previewRef.current;
    if (!ta) return false;
    ta.removeAttribute("readonly");
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.setAttribute("readonly", "");
    ta.setSelectionRange(0, 0);
    ta.blur();
    return ok;
  }

  function validateRequiredFields(): boolean {
    return formRef.current?.reportValidity() ?? false;
  }

  // 公式LINEを開くリンク（メイン／モバイル固定バー共通）。
  // 未入力があれば遷移させずフォームの該当箇所へ誘導する。
  function handleLineClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    buttonName: string,
  ) {
    if (!validateRequiredFields()) {
      e.preventDefault();
      return;
    }
    // CV計測：公式LINEを開いた（実質CV）
    trackEvent("line_click", {
      button_name: buttonName,
      link_url: LINE_URL,
      plan_name: plan || "未選択",
      copied: effectiveStatus === "copied",
      coupon: coupon?.code ?? "なし",
      from: from || "direct",
    });
  }

  async function handleCopy() {
    if (!validateRequiredFields()) return;

    let ok = false;
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(message);
        ok = true;
      } else {
        ok = fallbackCopy();
      }
    } catch {
      ok = fallbackCopy();
    }
    setActedMessage(message);
    setStatus(ok ? "copied" : "error");
    // CV計測：予約文のコピー成功＝フォーム完了（このフォームの「送信」に相当）
    // ※氏名・電話番号などの入力内容は送らない
    if (ok) {
      trackEvent("form_submit", {
        form_name: "booking",
        button_name: "copy",
        plan_name: plan || "未選択",
        coupon: coupon?.code ?? "なし",
        from: from || "direct",
      });
    }
  }

  return (
    <div className="mt-10 grid min-w-0 max-w-full touch-pan-y gap-8 overflow-x-clip overscroll-x-none lg:grid-cols-2">
      {/* 入力フォーム（カード） */}
      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        onFocus={handleFormStart}
        className="cosmic-panel min-w-0 max-w-full rounded-2xl p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold text-ink">{t ? t.formHeading : "予約内容を入力"}</h2>
        <p className="mt-1 text-xs text-muted">
          {t ? t.formSubtext : "入力すると右（スマホは下）の送信文が自動で作られます。"}
        </p>

        <div
          aria-live="polite"
          className={`mt-4 rounded-xl border p-4 ${
            incompleteRequiredItems.length === 0
              ? "border-emerald-300/25 bg-emerald-400/[0.08]"
              : "border-line bg-mist"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-sm font-bold ${
                incompleteRequiredItems.length === 0
                  ? "text-emerald-700"
                  : "text-accent"
              }`}
            >
              {incompleteRequiredItems.length === 0
                ? t
                  ? t.progressComplete
                  : "✓ 必須項目の入力が完了しました"
                : t
                  ? formatTemplate(t.progressRemaining, { n: incompleteRequiredItems.length })
                  : `必須項目はあと${incompleteRequiredItems.length}個です`}
            </p>
            <span className="shrink-0 text-xs font-semibold text-muted">
              {completedRequiredCount}/{requiredItems.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="必須項目の入力進捗"
            aria-valuemin={0}
            aria-valuemax={requiredItems.length}
            aria-valuenow={completedRequiredCount}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                incompleteRequiredItems.length === 0 ? "bg-emerald-300" : "bg-accent"
              }`}
              style={{ width: `${(completedRequiredCount / requiredItems.length) * 100}%` }}
            />
          </div>
          {incompleteRequiredItems.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {t ? t.missingPrefix : "未入力："}
              {incompleteRequiredItems.map((item) => item.label).join("・")}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.dateLabel : "撮影希望日"}
              <RequiredBadge label={requiredText} />
            </label>
            <input
              ref={dateInputRef}
              id="date"
              type="date"
              value={date}
              onChange={(e) => selectDate(e.target.value)}
              min={todayDateKey}
              required
              className={`${inputClass} [color-scheme:light]`}
            />
            {isSelectedDateClosed && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-700">
                {t
                  ? t.dateClosedNotice
                  : "この日は満月期間のため、星空フォトの撮影をお休みしています。別の日程をお選びください。"}
              </p>
            )}
            <AvailabilityCalendar
              selectedDate={date}
              onSelectDate={selectDate}
              monthIndex={availabilityMonthIndex}
              onMonthChange={setAvailabilityMonthIndex}
            />
            <div className="mt-4 rounded-xl border border-line bg-mist p-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-base"
                >
                  📍
                </span>
                <div>
                  <p className="text-sm font-bold text-accent">
                    {t ? t.locationsHintTitle : "主な撮影候補地があります"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {t
                      ? t.locationsHintText
                      : "前浜・友利博愛・白鳥岬周辺が主な候補です。最終的な集合場所は、その日の雲や風などを確認し、最もきれいに撮影できる場所を当日にLINEでご案内します。"}
                  </p>
                  <Link
                    href={accessHref}
                    className="cosmic-link mt-2 inline-flex text-xs font-semibold underline underline-offset-4"
                  >
                    {t ? t.locationsHintLink : "候補地と地図を確認する →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.timeWindowLabel : "希望時間帯"}
              <RequiredBadge label={requiredText} />
            </legend>
            <p id="preferred-time-help" className="mb-3 text-xs leading-relaxed text-muted">
              {t ? t.timeWindowHelp : "ご希望に近い時間帯を1つ選んでください。"}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {PREFERRED_TIME_WINDOWS.map((option) => {
                const selected = preferredTimeWindow === option.value;
                const translated = t?.timeWindows.find((w) => w.value === option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex min-h-24 cursor-pointer flex-col justify-center rounded-lg border px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-accent ${
                      selected
                        ? "border-line bg-mist shadow-sm shadow-none"
                        : "border-line bg-white hover:border-line hover:bg-mist"
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferred-time-window"
                      value={option.value}
                      checked={selected}
                      onChange={() => setPreferredTimeWindow(option.value)}
                      required
                      aria-describedby="preferred-time-help preferred-time-notice"
                      className="sr-only"
                    />
                    <span className={`text-base font-bold ${selected ? "text-accent" : "text-ink"}`}>
                      {translated?.label ?? option.label}
                    </span>
                    <span
                      className={`mt-1 text-[11px] leading-relaxed ${
                        option.value === "24:00〜翌4:00" ? "text-accent" : "text-muted"
                      }`}
                    >
                      {translated?.note ?? option.note}
                    </span>
                  </label>
                );
              })}
            </div>
            <div
              id="preferred-time-notice"
              className="mt-3 rounded-lg border border-line bg-mist p-3 text-xs leading-relaxed text-ink-soft"
            >
              <p className="font-semibold text-accent">
                {t ? t.timeWindowNoticeTitle : "選択した時間帯は、あくまでご希望枠です。"}
              </p>
              <p className="mt-1">
                {t
                  ? t.timeWindowNoticeText
                  : "月齢・星の位置・空き状況を確認し、原則としてご希望枠内で撮影時間を確定します。枠内での撮影が難しい場合は、LINEで別の時間をご提案します。"}
              </p>
            </div>
          </fieldset>

          <div>
            <label htmlFor="plan" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.planLabel : "希望プラン"}
              <RequiredBadge label={requiredText} />
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              required
              className={`${inputClass} [color-scheme:light]`}
            >
              <option value="">{t ? t.planPlaceholder : "選択してください"}</option>
              {planOptions.map((p) => (
                <option key={p.slug} value={p.name}>
                  {p.label ?? p.name}
                </option>
              ))}
              <option value="相談して決めたい">{t ? t.planUndecided : "相談して決めたい"}</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.nameLabel : "お名前"}
              <RequiredBadge label={requiredText} />
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t ? t.namePlaceholder : "山田 太郎"}
              required
              className={inputClass}
            />
          </div>

          <fieldset className="rounded-lg border border-line bg-white p-4">
            <legend className="px-1 text-sm font-medium text-ink">
              {t ? t.participantsLabel : "参加人数"}
              <RequiredBadge label={requiredText} />
            </legend>
            <p id="participant-count-help" className="mb-4 text-xs leading-relaxed text-muted">
              {t ? t.participantsHelp : "男女別の人数を入力すると、大人・子どもの人数と合計が自動で計算されます。"}
            </p>
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-mist p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">
                    {t ? t.adultsHeading : "大人（16才以上）"}
                  </p>
                  <p className="text-sm font-semibold text-accent">
                    {t ? `${t.totalLabel} ${adultsNum}` : `計 ${adultsNum}人`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ParticipantNumberInput
                    id="adult-male"
                    label={t ? t.male : "男性"}
                    unit={t ? "" : "人"}
                    value={adultMale}
                    onChange={setAdultMale}
                    inputRef={adultMaleRef}
                    describedBy="participant-count-help participant-count-status"
                    invalid={!participantCountComplete}
                  />
                  <ParticipantNumberInput
                    id="adult-female"
                    label={t ? t.female : "女性"}
                    unit={t ? "" : "人"}
                    value={adultFemale}
                    onChange={setAdultFemale}
                    describedBy="participant-count-help participant-count-status"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-line bg-mist p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">
                    {t ? t.childrenHeading : "子ども（0〜15才）"}
                  </p>
                  <p className="text-sm font-semibold text-accent">
                    {t ? `${t.totalLabel} ${childrenNum}` : `計 ${childrenNum}人`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ParticipantNumberInput
                    id="child-male"
                    label={t ? t.boy : "男の子"}
                    unit={t ? "" : "人"}
                    value={childMale}
                    onChange={setChildMale}
                    describedBy="participant-count-help participant-count-status"
                  />
                  <ParticipantNumberInput
                    id="child-female"
                    label={t ? t.girl : "女の子"}
                    unit={t ? "" : "人"}
                    value={childFemale}
                    onChange={setChildFemale}
                    describedBy="participant-count-help participant-count-status"
                  />
                </div>
              </div>
            </div>
            <p
              id="participant-count-status"
              aria-live="polite"
              className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${
                participantCountComplete
                  ? "bg-emerald-400/10 text-emerald-700"
                  : "bg-mist text-accent"
              }`}
            >
              {participantCount <= 0
                ? t
                  ? t.participantsEmpty
                  : "参加人数を入力してください"
                : participantCount <= 10
                  ? t
                    ? `✓ ${t.totalLabel} ${participantCount}（${t.adultsHeading} ${adultsNum}・${t.childrenHeading} ${childrenNum}）`
                    : `✓ 合計 ${participantCount}人（大人${adultsNum}人・子ども${childrenNum}人）`
                  : t
                    ? t.participantsOver
                    : `合計${participantCount}人です。10人を超える場合はLINEでご相談ください`}
            </p>
          </fieldset>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.phoneLabel : "携帯番号"}
              <RequiredBadge label={requiredText} />
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-1234-5678"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="hotel" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.hotelLabel : "宿泊施設名"}
            </label>
            <input
              id="hotel"
              type="text"
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              placeholder={t ? t.hotelPlaceholder : "〇〇リゾート宮古島"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stay" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.stayLabel : "滞在期間"}
            </label>
            <input
              id="stay"
              type="text"
              value={stay}
              onChange={(e) => setStay(e.target.value)}
              placeholder={t ? t.stayPlaceholder : "7/15〜7/18"}
              className={inputClass}
            />
          </div>

          {/* オプション */}
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.optionsLabel : "オプション（任意）"}
            </legend>
            <div className="space-y-2">
              <label className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink">
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pickup}
                    onChange={(e) => setPickup(e.target.checked)}
                    className="h-4 w-4 rounded border-line bg-white accent-accent"
                  />
                  {t ? t.pickupLabel : "送迎（3名まで）"}
                </span>
                <span className="shrink-0 text-accent">
                  +{formatPrice(pickupPrice)}
                </span>
              </label>
              <div className="rounded-lg border border-line bg-white px-4 py-3">
                <label
                  htmlFor="staff-name"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  {t ? t.nominationLabel : "カメラマン指名"}
                </label>
                <select
                  id="staff-name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className={`${inputClass} [color-scheme:light]`}
                >
                  <option value="">{t ? t.nominationNone : "指名なし（おまかせ） ¥0"}</option>
                  <option value="稲田">
                    {inadaNominationOption ?? `稲田を指名 +${formatPrice(staffNominationPrice)}`}
                  </option>
                  {teamMembers.map((member) => (
                    <option key={member.name} value={member.name}>
                      {t ? `${member.name} — ¥0` : `${member.name}を指名 ¥0`}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted">
                  {t
                    ? t.nominationNote
                    : `稲田の指名のみ＋${formatPrice(staffNominationPrice)}、その他のカメラマンは指名料無料です。`}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {t ? t.nominationNote2 : "※担当カメラマンによって写真のクオリティは変わりません。"}
                </p>
              </div>
            </div>
          </fieldset>

          <div className="rounded-lg border border-line bg-mist p-4 text-sm leading-relaxed text-ink-soft">
            <p className="font-semibold text-accent">
              {t ? t.lateNightTitle : "⚠️ 深夜料金について"}
            </p>
            <p id="late-night-fee-description" className="mt-1">
              {t
                ? t.lateNightText
                : `0:00〜0:59の撮影はお一人につき＋${formatPrice(LATE_NIGHT_FEES.midnight)}、1:00以降の撮影はお一人につき＋${formatPrice(LATE_NIGHT_FEES.afterOne)}の追加料金がかかります。`}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t
                ? t.lateNightNote
                : "※撮影時間は月齢や当日の空模様に合わせて確定するため、ご希望の時間帯に関わらず全てのご予約で事前確認をお願いしています。"}
            </p>
            <label className="mt-3 flex items-start gap-3 rounded-lg border border-line bg-white p-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={lateNightConsent}
                onChange={(e) => setLateNightConsent(e.target.checked)}
                required
                aria-describedby="late-night-fee-description"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line bg-white accent-accent"
              />
              <span>
                {t ? t.lateNightConsent : "深夜帯になった場合の追加料金について了承しました"}
                <RequiredBadge label={requiredText} />
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="instagram" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.instagramLabel : "Instagram（任意）"}
            </label>
            <input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder={t ? t.instagramPlaceholder : "instagram_id（@は不要）"}
              className={inputClass}
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={story}
                onChange={(e) => setStory(e.target.checked)}
                className="h-4 w-4 rounded border-line bg-white accent-accent"
              />
              {t ? t.storyConsent : "ストーリーへのタグ付けOK"}
            </label>
          </div>

          {/* クーポン */}
          <div>
            <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium text-ink">
              {t ? t.couponLabel : "クーポンコード（任意）"}
            </label>
            <input
              id="coupon"
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder={t ? t.couponPlaceholder : "お持ちの方は入力"}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={couponInvalid}
              className={inputClass}
            />
            <div aria-live="polite" className="mt-1.5 min-h-[1.25rem] text-xs">
              {coupon && discountAmount > 0 && (
                <p className="font-medium text-emerald-700">
                  {t ? t.couponApplied : "適用"}：{coupon.code} −{formatPrice(discountAmount)}
                </p>
              )}
              {coupon && discountAmount === 0 && subtotal == null && (
                <p className="text-accent">
                  {t ? t.couponQuoteOnly : "このプランは概算が出ないため、お見積り時に適用します"}
                </p>
              )}
              {couponInvalid && (
                <p className="text-rose-700">{t ? t.couponInvalid : "クーポンが見つかりません"}</p>
              )}
            </div>
          </div>
        </div>

        {/* お会計（概算） */}
        <div className="mt-6 rounded-lg border border-line bg-mist p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-ink">
              {t ? t.totalHeading : "お会計（概算）"}
            </span>
            <span className="text-right text-xl font-bold text-accent">
              {plan && total != null ? formatPrice(total) : t ? t.totalPlaceholder : totalText}
            </span>
          </div>
          {breakdown.length > 0 && (
            <ul className="mt-3 space-y-0.5 text-xs text-muted">
              {breakdown.map((b) => (
                <li key={b}>・{b}</li>
              ))}
            </ul>
          )}
          {selectedPlan?.kind === "perGroup" && (
            <p
              className={`mt-2 text-xs ${exceedsParticipantLimit ? "font-medium text-accent" : "text-muted"}`}
            >
              {selectedPlan.maxParticipants != null
                ? `※${selectedPlan.name}は1組${selectedPlan.maxParticipants}名までです。${selectedPlan.maxParticipants + 1}名以上はLINEでご相談ください。`
                : `※${selectedPlan.name}は人数に関わらず1組あたりの料金です。`}
            </p>
          )}
          <p className="mt-3 text-xs font-medium text-accent">
            {t ? t.cashOnlyNote : "💴 お支払いは「現地にて現金決済のみ」です。"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t
              ? t.lateNightExcludedNote
              : "※上記の概算には深夜料金は含まれていません。撮影時間の確定後、LINEで最終金額をご案内します。"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-xs text-muted">
            {t ? t.autoSaveNote : "入力内容はこの端末に自動保存されます"}
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-line bg-mist px-4 py-1.5 text-xs text-ink-soft transition-colors hover:border-line hover:text-accent"
          >
            {t ? t.clearButton : "入力内容をクリア"}
          </button>
        </div>
      </form>

      {/* プレビュー + アクション */}
      <div className="min-w-0 max-w-full lg:sticky lg:top-20 lg:self-start">
        <div className="cosmic-panel min-w-0 max-w-full rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-ink">{t ? t.previewHeading : "送信内容プレビュー"}</h2>
          <p className="mt-1 text-xs text-muted">
            {t ? t.previewSubtext : "この内容をコピーして、公式LINEのトークに貼り付けて送信してください。"}
          </p>

          {/* モバイルは max-h で圧縮（中はスクロール可）。長大な全文でボタンが
              画面外に追いやられるのを防ぐ。sm以上は従来どおり全文表示。 */}
          <textarea
            ref={previewRef}
            readOnly
            value={message}
            rows={18}
            aria-label={t ? t.previewHeading : "送信内容プレビュー"}
            className="mt-4 min-w-0 w-full max-w-full resize-none rounded-lg border border-line bg-white p-4 text-base leading-relaxed text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none max-h-56 sm:max-h-none sm:text-xs"
          />

          {/* ステータス表示 */}
          <div aria-live="polite" className="mt-4 min-h-[1.5rem]">
            {effectiveStatus === "copied" && (
              <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-700">
                {t ? t.copiedNotice : "コピーしました。LINEで貼り付けて送信してください。"}
              </p>
            )}
            {effectiveStatus === "error" && (
              <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-700">
                {t
                  ? t.copyErrorNotice
                  : "自動コピーできませんでした。プレビューを長押し／選択して手動でコピーしてください。"}
              </p>
            )}
          </div>

          {/* ボタン */}
          <div ref={actionsRef} className="mt-2 space-y-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-line bg-accent text-base font-bold text-on-accent shadow-none transition-colors hover:bg-accent-hover"
            >
              {t ? t.copyButton : "内容をコピーする"}
            </button>

            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleLineClick(e, "booking_form")}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-lg text-base font-bold transition-all ${
                effectiveStatus === "copied"
                  ? "scale-[1.02] bg-[#06C755] text-ink shadow-sm"
                  : "border border-[#06C755]/60 bg-[#06C755]/10 text-[#17613b]"
              }`}
            >
              {t ? t.lineButton : "公式LINEを開く"}
            </a>

            <p className="text-center text-xs text-muted">
              {t
                ? t.lineFinalNote
                : "※自動では送信されません。LINEを開いたら、トークに貼り付け（ペースト）して送信してください。"}
            </p>
          </div>
        </div>
      </div>

      {/* モバイル用の固定アクションバー。
          長いフォームのどこからでも進捗確認とコピー→LINEに進めるようにする。
          本来のアクションボタンが見えている間は重複するため非表示。 */}
      {!actionsInView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 lg:hidden">
          <p
            aria-live="polite"
            className={`text-center text-xs font-semibold ${
              incompleteRequiredItems.length === 0
                ? "text-emerald-700"
                : "text-accent"
            }`}
          >
            {incompleteRequiredItems.length === 0
              ? t
                ? t.stickyComplete
                : "✓ 必須項目の入力が完了しました。コピーして送信へ"
              : t
                ? formatTemplate(t.stickyRemaining, { n: incompleteRequiredItems.length })
                : `必須項目 あと${incompleteRequiredItems.length}個（${completedRequiredCount}/${requiredItems.length}）`}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-12 items-center justify-center gap-1.5 rounded-lg border border-line bg-accent text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover"
            >
              {t ? t.stickyCopy : "内容をコピー"}
            </button>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleLineClick(e, "booking_form_sticky")}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-all ${
                effectiveStatus === "copied"
                  ? "bg-[#06C755] text-ink shadow-lg shadow-[#06C755]/30"
                  : "border border-[#06C755]/60 bg-[#06C755]/10 text-[#17613b]"
              }`}
            >
              {t ? t.stickyLine : "LINEを開く"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
