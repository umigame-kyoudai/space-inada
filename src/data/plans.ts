/**
 * プラン定義 = 単一の真実。
 * 公式LINE「撮影メニュー」の実データに基づく。
 * /plans 一覧・/plans/[plan] 詳細・sitemap・内部リンクがすべてこの配列を参照する。
 */

export type PlanSlug =
  | "casual"
  | "standard"
  | "family"
  | "creative"
  | "propose"
  | "space-inada";

export type Plan = {
  slug: PlanSlug;
  name: string;
  /** カードのバッジ（例: 人気No.1！） */
  badge?: string;
  /** 一覧やヒーローで使う一文 */
  tagline: string;
  /** 誰向けか（狙うKWと一致させる） */
  forWhom: string[];
  /** 表示する代表価格。未設定なら「詳細はお問い合わせ」。/人 なら大人1名、/組 なら1組の料金。 */
  priceFrom?: number;
  /** 価格の単位表記（例: "/人", "/組"） */
  priceUnit?: string;
  /** 子供（0〜15才）料金。"/人" プランのみ。予約フォームの合計計算に使う。 */
  childPrice?: number;
  /** 料金内訳の各行 */
  pricingDetail: string[];
  /** 撮影時間（分）。未設定なら「応相談」 */
  durationMin?: number;
  deliveryCount: string;
  features: string[];
  /** このプランで狙う検索キーワード */
  keywords: string[];
  seo: {
    title: string;
    description: string;
  };
  /** sitemap lastModified 用（ISO日付） */
  updatedAt: string;
  /** 近日公開（ティザー）。true なら料金・予約は出さず「近日公開」表示にする。 */
  comingSoon?: boolean;
};

export const plans: Plan[] = [
  {
    slug: "casual",
    name: "カジュアルプラン",
    badge: "手軽に体験！",
    tagline: "手軽に宮古島の星空フォトを体験。",
    forWhom: ["カップル", "友人同士", "はじめての方"],
    priceFrom: 7000,
    priceUnit: "/人",
    childPrice: 3000,
    pricingDetail: ["大人 ¥7,000 / 人", "子供 ¥3,000 / 人（0〜15才）"],
    durationMin: 15,
    deliveryCount: "約8枚",
    features: [
      "手軽に楽しめる星空フォト体験",
      "満天の星空を背景に撮影",
      "ポーズが苦手でも安心のディレクション",
    ],
    keywords: ["宮古島 カップル フォト", "宮古島 星空フォト"],
    seo: {
      title: "カジュアルプラン｜宮古島のカップル星空フォト",
      description:
        "宮古島で手軽に楽しめるカップル向け星空フォトプラン。大人¥7,000/人から、満天の星空を背景にプロが撮影。はじめての方も安心です。",
    },
    updatedAt: "2026-06-06",
  },
  {
    slug: "standard",
    name: "スタンダードプラン",
    badge: "人気No.1！",
    tagline: "30分いっぱい撮ろう！記念日・家族・カップルの定番。",
    forWhom: ["記念日", "家族", "カップル"],
    priceFrom: 9000,
    priceUnit: "/人",
    childPrice: 5000,
    pricingDetail: ["大人 ¥9,000 / 人", "子供 ¥5,000 / 人（0〜15才）"],
    durationMin: 30,
    deliveryCount: "データ全て",
    features: [
      "30分たっぷり撮影",
      "撮影データはすべてお渡し",
      "記念日・家族・カップルに最適",
    ],
    keywords: ["宮古島 記念日 写真", "宮古島 家族写真", "宮古島 カップル フォト"],
    seo: {
      title: "スタンダードプラン｜宮古島の記念日・家族星空フォト",
      description:
        "宮古島の星空を背景に記念日や家族写真を残す人気No.1プラン。大人¥9,000/人、30分たっぷり撮影、撮影データはすべてお渡しします。",
    },
    updatedAt: "2026-06-06",
  },
  {
    slug: "family",
    name: "ファミリープラン",
    badge: "みんなで思い出に",
    tagline: "家族みんなでの撮影に。",
    forWhom: ["家族", "三世代", "グループ"],
    priceFrom: 18000,
    priceUnit: "/組",
    pricingDetail: ["1組 ¥18,000", "※ソロショットなし"],
    durationMin: 20,
    deliveryCount: "約10枚",
    features: [
      "家族みんなを一緒に撮影",
      "星空を背景にした集合カット",
      "お子様連れも安心",
    ],
    keywords: ["宮古島 家族写真", "宮古島 星空フォト"],
    seo: {
      title: "ファミリープラン｜宮古島の家族星空フォト",
      description:
        "宮古島の星空を背景に家族写真を残すプラン。1組¥18,000、約20分の撮影で家族みんなの思い出を一枚に。お子様連れも安心です。",
    },
    updatedAt: "2026-06-06",
  },
  {
    slug: "creative",
    name: "クリエイティブプラン",
    badge: "他にはない撮影✨",
    tagline: "電飾を使った、他にはない特別な一枚（カップル/夫婦限定）。",
    forWhom: ["カップル", "夫婦", "作品性重視"],
    priceFrom: 28000,
    priceUnit: "/組",
    pricingDetail: ["1組 ¥28,000", "電飾3枚＋通常カット", "※カップル/夫婦限定"],
    durationMin: 30,
    deliveryCount: "データ全て",
    features: [
      "電飾を使った他にはない演出",
      "電飾3枚＋通常カット",
      "撮影データはすべてお渡し",
    ],
    keywords: ["宮古島 星空フォト", "宮古島 天の川 写真"],
    seo: {
      title: "クリエイティブプラン｜宮古島の電飾星空フォト",
      description:
        "宮古島で電飾を使った他にはない星空フォト（カップル/夫婦限定）。1組¥28,000、電飾3枚＋通常カット、データ全てお渡しの特別なプランです。",
    },
    updatedAt: "2026-06-06",
  },
  {
    slug: "propose",
    name: "プロポーズプラン",
    badge: "一生の思い出を",
    tagline: "宮古島の星空の下で、人生最高のサプライズを。",
    forWhom: ["プロポーズ", "サプライズ", "特別な告白"],
    // 料金は内容により変動するため個別見積り
    pricingDetail: ["詳細はお問い合わせください"],
    deliveryCount: "ご相談に応じてご用意",
    features: [
      "サプライズの段取りを事前に綿密設計",
      "決定的瞬間を逃さない撮影",
      "リング・装飾などの演出サポート",
    ],
    keywords: ["宮古島 プロポーズ 撮影", "宮古島 記念日 写真"],
    seo: {
      title: "プロポーズプラン｜宮古島の星空プロポーズ撮影",
      description:
        "宮古島の満天の星空の下でプロポーズを成功させる撮影プラン。サプライズの段取りから決定的瞬間の撮影まで、一生の思い出を確実に残します。",
    },
    updatedAt: "2026-06-06",
  },
  {
    slug: "space-inada",
    name: "スペース稲田 スペースシャトル星空ツアー",
    badge: "近日公開",
    comingSoon: true,
    tagline:
      "スペースシャトルに乗り込むような没入演出で、宮古島の星空を旅する特別ツアー。近日公開。",
    forWhom: ["特別な体験", "記念日", "星空好き"],
    // 料金・撮影時間・納品はすべて公開時に確定（comingSoon のため未設定）
    pricingDetail: ["近日公開"],
    deliveryCount: "近日公開",
    features: [
      "スペースシャトルの世界観で星空へ“出発”する没入型の演出",
      "宮古島の夜空を巡る、スペース稲田だけのシグネチャー体験",
      "詳細は近日公開。公式LINEで先行案内をお届け予定です",
    ],
    keywords: ["宮古島 星空 ツアー", "スペース稲田", "宮古島 星空フォト"],
    seo: {
      title: "スペース稲田 スペースシャトル星空ツアー（近日公開）｜宮古島の星空体験",
      description:
        "宮古島の星空を旅するスペース稲田のシグネチャー体験「スペースシャトル星空ツアー」。近日公開予定。公式LINEで先行案内をお届けします。",
    },
    updatedAt: "2026-06-08",
  },
];

/** 追加オプション（公式LINEメニューより） */
export type PlanOption = {
  name: string;
  detail: string[];
  priceFrom?: number;
  /** priceFrom の後ろに付ける文字。未指定は「〜」、空文字なら固定料金。 */
  priceSuffix?: string;
  priceNote?: string;
};

export const INADA_NOMINATION_PRICE = 2000;

export const LATE_NIGHT_FEES = {
  midnight: 1000,
  afterOne: 2000,
} as const;

export const planOptions: PlanOption[] = [
  {
    name: "送迎",
    detail: ["行き帰り安心！3名まで", "※4名からは要相談"],
    priceFrom: 6000,
    priceSuffix: "",
  },
  {
    name: "カメラマン指名",
    detail: [
      `稲田を指名 +${formatPrice(INADA_NOMINATION_PRICE)}`,
      "Toon・Shoの指名は無料",
    ],
    priceNote: `${formatPrice(0)}〜${formatPrice(INADA_NOMINATION_PRICE)}`,
  },
  {
    name: "深夜料金",
    detail: [
      `0:00〜0:59 +${formatPrice(LATE_NIGHT_FEES.midnight)}／人`,
      `1:00以降 +${formatPrice(LATE_NIGHT_FEES.afterOne)}／人`,
    ],
    priceNote: "時間帯により加算",
  },
  {
    name: "場所指定",
    detail: ["インスタで見た撮りたい場所を指定"],
    priceNote: "応相談",
  },
];

export function getPlans(): Plan[] {
  return plans;
}

/** 予約可能なプランのみ（近日公開を除外）。比較表・予約フォームの選択肢に使う。 */
export function getBookablePlans(): Plan[] {
  return plans.filter((p) => !p.comingSoon);
}

export function getPlan(slug: string): Plan | undefined {
  return plans.find((p) => p.slug === slug);
}

export function getPlanOptions(): PlanOption[] {
  return planOptions;
}

/** 表示用の価格レンジ（priceFrom が設定されたプランのみ対象）。 */
export function getPriceRange(): { min: number; max: number } | null {
  const prices = plans
    .map((p) => p.priceFrom)
    .filter((v): v is number => typeof v === "number");
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatPrice(yen: number): string {
  return `¥${yen.toLocaleString("ja-JP")}`;
}

/** 料金体系の種別。perPerson=1人ごと / perGroup=1組固定 / quote=要見積り */
export type PlanPriceKind = "perPerson" | "perGroup" | "quote";

export function planPriceKind(plan: Plan): PlanPriceKind {
  if (typeof plan.priceFrom !== "number") return "quote";
  return plan.priceUnit === "/組" ? "perGroup" : "perPerson";
}

/** 送迎オプションの料金（予約フォームの合計計算に使う）。 */
export function getPickupPrice(): number {
  return planOptions.find((o) => o.name === "送迎")?.priceFrom ?? 6000;
}

/** カード等で使う価格の表示文字列（近日公開→「近日公開」、未設定→「詳細はお問い合わせ」）。 */
export function planPriceLabel(plan: Plan): string {
  if (plan.comingSoon) return "近日公開";
  if (typeof plan.priceFrom !== "number") return "詳細はお問い合わせ";
  return `${formatPrice(plan.priceFrom)}${plan.priceUnit ?? ""}〜`;
}
