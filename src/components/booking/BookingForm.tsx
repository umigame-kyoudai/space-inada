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

/** 公式LINE（予約相談） */
const LINE_URL = "https://lin.ee/5z6HX4S";

/** 入力内容の自動保存キー（離脱しても復元する） */
const STORAGE_KEY = "booking-form-v2";

type PlanOption = {
  slug: string;
  name: string;
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
━━━━━━━━━━━━━━━━`;
}

const inputClass =
  "min-w-0 w-full max-w-full rounded-lg border border-teal-200/15 bg-[#050814]/80 px-4 py-3 text-base text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-teal-200/70 sm:text-sm";

function RequiredBadge() {
  return (
    <span className="ml-2 rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
      必須
    </span>
  );
}

function ParticipantNumberInput({
  id,
  label,
  value,
  onChange,
  inputRef,
  describedBy,
  invalid = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  describedBy: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-300">
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
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-500">
          人
        </span>
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
}: Props) {
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
  // コピー／コピー失敗の操作対象だったメッセージ。現在のメッセージと違えば「古い」状態とみなす。
  const [actedMessage, setActedMessage] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const adultMaleRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLTextAreaElement>(null);
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
      label: "撮影希望日",
      complete: Boolean(date) && date >= todayDateKey && !isSelectedDateClosed,
    },
    { label: "希望時間帯", complete: Boolean(preferredTimeWindow) },
    { label: "希望プラン", complete: Boolean(plan) },
    { label: "お名前", complete: Boolean(name.trim()) },
    { label: "参加人数・性別", complete: participantCountComplete },
    { label: "携帯番号", complete: Boolean(phone.trim()) },
    { label: "深夜料金への同意", complete: lateNightConsent },
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
        ? "この日は満月期間のため、星空フォトの撮影をお休みしています。別の日程をお選びください。"
        : "",
    );
  }, [isSelectedDateClosed]);

  useEffect(() => {
    const message =
      participantCount <= 0
        ? "参加人数を1名以上入力してください。"
        : participantCount <= 10
          ? ""
          : "参加人数は10名までです。11名以上の場合はLINEでご相談ください。";
    adultMaleRef.current?.setCustomValidity(message);
  }, [participantCount]);

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
        className="cosmic-panel min-w-0 max-w-full rounded-lg p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold text-white">予約内容を入力</h2>
        <p className="mt-1 text-xs text-zinc-500">
          入力すると右（スマホは下）の送信文が自動で作られます。
        </p>

        <div
          aria-live="polite"
          className={`mt-4 rounded-xl border p-4 ${
            incompleteRequiredItems.length === 0
              ? "border-emerald-300/25 bg-emerald-400/[0.08]"
              : "border-amber-200/20 bg-amber-300/[0.06]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-sm font-bold ${
                incompleteRequiredItems.length === 0
                  ? "text-emerald-200"
                  : "text-amber-100"
              }`}
            >
              {incompleteRequiredItems.length === 0
                ? "✓ 必須項目の入力が完了しました"
                : `必須項目はあと${incompleteRequiredItems.length}個です`}
            </p>
            <span className="shrink-0 text-xs font-semibold text-zinc-400">
              {completedRequiredCount}/{requiredItems.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="必須項目の入力進捗"
            aria-valuemin={0}
            aria-valuemax={requiredItems.length}
            aria-valuenow={completedRequiredCount}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                incompleteRequiredItems.length === 0 ? "bg-emerald-300" : "bg-amber-300"
              }`}
              style={{ width: `${(completedRequiredCount / requiredItems.length) * 100}%` }}
            />
          </div>
          {incompleteRequiredItems.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              未入力：{incompleteRequiredItems.map((item) => item.label).join("・")}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-zinc-200">
              撮影希望日
              <RequiredBadge />
            </label>
            <input
              ref={dateInputRef}
              id="date"
              type="date"
              value={date}
              onChange={(e) => selectDate(e.target.value)}
              min={todayDateKey}
              required
              className={`${inputClass} [color-scheme:dark]`}
            />
            {isSelectedDateClosed && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-300">
                この日は満月期間のため、星空フォトの撮影をお休みしています。別の日程をお選びください。
              </p>
            )}
            <AvailabilityCalendar
              selectedDate={date}
              onSelectDate={selectDate}
              monthIndex={availabilityMonthIndex}
              onMonthChange={setAvailabilityMonthIndex}
            />
            <div className="mt-4 rounded-xl border border-teal-200/20 bg-teal-200/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-200/15 text-base"
                >
                  📍
                </span>
                <div>
                  <p className="text-sm font-bold text-teal-100">主な撮影候補地があります</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                    前浜・友利博愛・白鳥岬周辺が主な候補です。最終的な集合場所は、その日の雲や風などを確認し、最もきれいに撮影できる場所を当日にLINEでご案内します。
                  </p>
                  <Link
                    href="/access#shooting-locations"
                    className="cosmic-link mt-2 inline-flex text-xs font-semibold underline underline-offset-4"
                  >
                    候補地と地図を確認する →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-zinc-200">
              希望時間帯
              <RequiredBadge />
            </legend>
            <p id="preferred-time-help" className="mb-3 text-xs leading-relaxed text-zinc-400">
              ご希望に近い時間帯を1つ選んでください。
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {PREFERRED_TIME_WINDOWS.map((option) => {
                const selected = preferredTimeWindow === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex min-h-24 cursor-pointer flex-col justify-center rounded-lg border px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-teal-200/70 ${
                      selected
                        ? "border-teal-200/80 bg-teal-200/15 shadow-sm shadow-teal-300/10"
                        : "border-teal-200/15 bg-[#050814]/60 hover:border-teal-200/45 hover:bg-teal-200/[0.06]"
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
                    <span className={`text-base font-bold ${selected ? "text-teal-100" : "text-white"}`}>
                      {option.label}
                    </span>
                    <span
                      className={`mt-1 text-[11px] leading-relaxed ${
                        option.value === "24:00〜翌4:00" ? "text-amber-200" : "text-zinc-400"
                      }`}
                    >
                      {option.note}
                    </span>
                  </label>
                );
              })}
            </div>
            <div
              id="preferred-time-notice"
              className="mt-3 rounded-lg border border-amber-200/20 bg-amber-300/[0.06] p-3 text-xs leading-relaxed text-zinc-300"
            >
              <p className="font-semibold text-amber-100">選択した時間帯は、あくまでご希望枠です。</p>
              <p className="mt-1">
                月齢・星の位置・空き状況を確認し、原則としてご希望枠内で撮影時間を確定します。枠内での撮影が難しい場合は、LINEで別の時間をご提案します。
              </p>
            </div>
          </fieldset>

          <div>
            <label htmlFor="plan" className="mb-1.5 block text-sm font-medium text-zinc-200">
              希望プラン
              <RequiredBadge />
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              required
              className={`${inputClass} [color-scheme:dark]`}
            >
              <option value="">選択してください</option>
              {planOptions.map((p) => (
                <option key={p.slug} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value="相談して決めたい">相談して決めたい</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-200">
              お名前
              <RequiredBadge />
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 太郎"
              required
              className={inputClass}
            />
          </div>

          <fieldset className="rounded-lg border border-teal-200/15 bg-[#050814]/45 p-4">
            <legend className="px-1 text-sm font-medium text-zinc-200">
              参加人数
              <RequiredBadge />
            </legend>
            <p id="participant-count-help" className="mb-4 text-xs leading-relaxed text-zinc-400">
              男女別の人数を入力すると、大人・子どもの人数と合計が自動で計算されます。
            </p>
            <div className="space-y-4">
              <div className="rounded-lg border border-white/5 bg-white/[0.025] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">大人（16才以上）</p>
                  <p className="text-sm font-semibold text-teal-200">計 {adultsNum}人</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ParticipantNumberInput
                    id="adult-male"
                    label="男性"
                    value={adultMale}
                    onChange={setAdultMale}
                    inputRef={adultMaleRef}
                    describedBy="participant-count-help participant-count-status"
                    invalid={!participantCountComplete}
                  />
                  <ParticipantNumberInput
                    id="adult-female"
                    label="女性"
                    value={adultFemale}
                    onChange={setAdultFemale}
                    describedBy="participant-count-help participant-count-status"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.025] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">子ども（0〜15才）</p>
                  <p className="text-sm font-semibold text-teal-200">計 {childrenNum}人</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ParticipantNumberInput
                    id="child-male"
                    label="男の子"
                    value={childMale}
                    onChange={setChildMale}
                    describedBy="participant-count-help participant-count-status"
                  />
                  <ParticipantNumberInput
                    id="child-female"
                    label="女の子"
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
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-amber-300/10 text-amber-200"
              }`}
            >
              {participantCount <= 0
                ? "参加人数を入力してください"
                : participantCount <= 10
                  ? `✓ 合計 ${participantCount}人（大人${adultsNum}人・子ども${childrenNum}人）`
                  : `合計${participantCount}人です。10人を超える場合はLINEでご相談ください`}
            </p>
          </fieldset>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-zinc-200">
              携帯番号
              <RequiredBadge />
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
            <label htmlFor="hotel" className="mb-1.5 block text-sm font-medium text-zinc-200">
              宿泊施設名
            </label>
            <input
              id="hotel"
              type="text"
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              placeholder="〇〇リゾート宮古島"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stay" className="mb-1.5 block text-sm font-medium text-zinc-200">
              滞在期間
            </label>
            <input
              id="stay"
              type="text"
              value={stay}
              onChange={(e) => setStay(e.target.value)}
              placeholder="7/15〜7/18"
              className={inputClass}
            />
          </div>

          {/* オプション */}
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-zinc-200">
              オプション（任意）
            </legend>
            <div className="space-y-2">
              <label className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-teal-200/15 bg-[#050814]/60 px-4 py-3 text-sm text-zinc-200">
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pickup}
                    onChange={(e) => setPickup(e.target.checked)}
                    className="h-4 w-4 rounded border-teal-200/20 bg-[#050814] accent-teal-300"
                  />
                  送迎（3名まで）
                </span>
                <span className="shrink-0 text-amber-200">
                  +{formatPrice(pickupPrice)}
                </span>
              </label>
              <div className="rounded-lg border border-teal-200/15 bg-[#050814]/60 px-4 py-3">
                <label
                  htmlFor="staff-name"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  カメラマン指名
                </label>
                <select
                  id="staff-name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                >
                  <option value="">指名なし（おまかせ） ¥0</option>
                  <option value="稲田">
                    稲田を指名 +{formatPrice(staffNominationPrice)}
                  </option>
                  {teamMembers.map((member) => (
                    <option key={member.name} value={member.name}>
                      {member.name}を指名 ¥0
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-zinc-400">
                  稲田の指名のみ＋{formatPrice(staffNominationPrice)}、その他のカメラマンは指名料無料です。
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  ※担当カメラマンによって写真のクオリティは変わりません。
                </p>
              </div>
            </div>
          </fieldset>

          <div className="rounded-lg border border-amber-200/20 bg-amber-300/5 p-4 text-sm leading-relaxed text-zinc-300">
            <p className="font-semibold text-amber-100">
              ⚠️ 深夜料金について
            </p>
            <p id="late-night-fee-description" className="mt-1">
              0:00〜0:59の撮影はお一人につき＋{formatPrice(LATE_NIGHT_FEES.midnight)}、1:00以降の撮影はお一人につき＋{formatPrice(LATE_NIGHT_FEES.afterOne)}の追加料金がかかります。
            </p>
            <label className="mt-3 flex items-start gap-3 rounded-lg border border-amber-200/25 bg-[#050814]/60 p-3 text-sm text-zinc-200">
              <input
                type="checkbox"
                checked={lateNightConsent}
                onChange={(e) => setLateNightConsent(e.target.checked)}
                required
                aria-describedby="late-night-fee-description"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-teal-200/20 bg-[#050814] accent-teal-300"
              />
              <span>
                深夜帯になった場合の追加料金について了承しました
                <RequiredBadge />
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="instagram" className="mb-1.5 block text-sm font-medium text-zinc-200">
              Instagram（任意）
            </label>
            <input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="instagram_id（@は不要）"
              className={inputClass}
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={story}
                onChange={(e) => setStory(e.target.checked)}
                className="h-4 w-4 rounded border-teal-200/20 bg-[#050814] accent-teal-300"
              />
              ストーリーへのタグ付けOK
            </label>
          </div>

          {/* クーポン */}
          <div>
            <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium text-zinc-200">
              クーポンコード（任意）
            </label>
            <input
              id="coupon"
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="お持ちの方は入力"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={couponInvalid}
              className={inputClass}
            />
            <div aria-live="polite" className="mt-1.5 min-h-[1.25rem] text-xs">
              {coupon && discountAmount > 0 && (
                <p className="font-medium text-emerald-300">
                  適用：{coupon.code} −{formatPrice(discountAmount)}
                </p>
              )}
              {coupon && discountAmount === 0 && subtotal == null && (
                <p className="text-amber-200">
                  このプランは概算が出ないため、お見積り時に適用します
                </p>
              )}
              {couponInvalid && (
                <p className="text-rose-300">クーポンが見つかりません</p>
              )}
            </div>
          </div>
        </div>

        {/* お会計（概算） */}
        <div className="mt-6 rounded-lg border border-amber-200/25 bg-amber-300/5 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-zinc-200">お会計（概算）</span>
            <span className="text-right text-xl font-bold text-amber-200">
              {plan && total != null ? formatPrice(total) : totalText}
            </span>
          </div>
          {breakdown.length > 0 && (
            <ul className="mt-3 space-y-0.5 text-xs text-zinc-400">
              {breakdown.map((b) => (
                <li key={b}>・{b}</li>
              ))}
            </ul>
          )}
          {selectedPlan?.kind === "perGroup" && (
            <p
              className={`mt-2 text-xs ${exceedsParticipantLimit ? "font-medium text-amber-200" : "text-zinc-500"}`}
            >
              {selectedPlan.maxParticipants != null
                ? `※${selectedPlan.name}は1組${selectedPlan.maxParticipants}名までです。${selectedPlan.maxParticipants + 1}名以上はLINEでご相談ください。`
                : `※${selectedPlan.name}は人数に関わらず1組あたりの料金です。`}
            </p>
          )}
          <p className="mt-3 text-xs font-medium text-amber-100/80">
            💴 お支払いは「現地にて現金決済のみ」です。
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            ※上記の概算には深夜料金は含まれていません。撮影時間の確定後、LINEで最終金額をご案内します。
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-teal-200/10 pt-5">
          <p className="text-xs text-zinc-500">入力内容はこの端末に自動保存されます</p>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-teal-200/15 bg-slate-950/40 px-4 py-1.5 text-xs text-zinc-300 transition-colors hover:border-amber-200/60 hover:text-amber-100"
          >
            入力内容をクリア
          </button>
        </div>
      </form>

      {/* プレビュー + アクション */}
      <div className="min-w-0 max-w-full lg:sticky lg:top-20 lg:self-start">
        <div className="cosmic-panel min-w-0 max-w-full rounded-lg p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">送信内容プレビュー</h2>
          <p className="mt-1 text-xs text-zinc-500">
            この内容をコピーして、公式LINEのトークに貼り付けて送信してください。
          </p>

          <textarea
            ref={previewRef}
            readOnly
            value={message}
            rows={18}
            aria-label="送信内容プレビュー"
            className="mt-4 min-w-0 w-full max-w-full resize-none rounded-lg border border-teal-200/15 bg-[#03040a]/85 p-4 text-base leading-relaxed text-zinc-200 outline-none sm:text-xs"
          />

          {/* ステータス表示 */}
          <div aria-live="polite" className="mt-4 min-h-[1.5rem]">
            {effectiveStatus === "copied" && (
              <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-300">
                コピーしました。LINEで貼り付けて送信してください。
              </p>
            )}
            {effectiveStatus === "error" && (
              <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-300">
                自動コピーできませんでした。プレビューを長押し／選択して手動でコピーしてください。
              </p>
            )}
          </div>

          {/* ボタン */}
          <div className="mt-2 space-y-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-amber-200/70 bg-amber-300 text-base font-bold text-zinc-950 shadow-lg shadow-amber-300/15 transition-colors hover:bg-teal-200"
            >
              📋 内容をコピーする
            </button>

            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!validateRequiredFields()) {
                  e.preventDefault();
                  return;
                }
                // CV計測：公式LINEを開いた（実質CV）
                trackEvent("line_click", {
                  button_name: "booking_form",
                  link_url: LINE_URL,
                  plan_name: plan || "未選択",
                  copied: effectiveStatus === "copied",
                  coupon: coupon?.code ?? "なし",
                  from: from || "direct",
                });
              }}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-lg text-base font-bold transition-all ${
                effectiveStatus === "copied"
                  ? "scale-[1.02] bg-[#06C755] text-white shadow-lg shadow-[#06C755]/30 animate-pulse"
                  : "border border-[#06C755]/60 bg-[#06C755]/10 text-[#5fe39a]"
              }`}
            >
              💬 公式LINEを開く
            </a>

            <p className="text-center text-xs text-zinc-500">
              ※自動では送信されません。LINEを開いたら、トークに貼り付け（ペースト）して送信してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
