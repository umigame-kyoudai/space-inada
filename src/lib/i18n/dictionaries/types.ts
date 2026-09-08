import type { PlanSlug } from "@/data/plans";

/**
 * 翻訳辞書の型。en/ko/zh の3辞書がすべてこの形を満たすことを型で保証する。
 * 日本語ページのコピーそのものではなく、観光客向けに要点を絞った翻訳。
 */
export type Dictionary = {
  nav: {
    plans: string;
    access: string;
    faq: string;
    gallery: string;
    about: string;
    blog: string;
    voice: string;
    bookCta: string;
    /** 日本語サイトへ戻るリンク */
    backToJapanese: string;
  };
  footer: {
    plansHeading: string;
    siteHeading: string;
    contactHeading: string;
    bookCta: string;
    gallery: string;
    about: string;
    blog: string;
    voice: string;
    faq: string;
    access: string;
    areaServed: string;
    hours: string;
    privacy: string;
    legal: string;
    /** 未翻訳ページへのリンクに添える注記 */
    japaneseOnly: string;
  };
  common: {
    required: string;
    yen: string;
    perPerson: string;
    perGroup: string;
    /** "{min}" を分数で置換するテンプレート（例: "About {min} min"）。formatTemplate で展開する */
    minutesApprox: string;
    consultRequired: string;
    comingSoon: string;
  };
  home: {
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    heroSecondaryCta: string;
    whyTitle: string;
    why: { title: string; text: string }[];
    flowTitle: string;
    flowSubtitle: string;
    flow: { title: string; text: string }[];
    plansTitle: string;
    plansViewAll: string;
    galleryTitle: string;
    galleryViewAll: string;
    ctaHeading: string;
    ctaText: string;
    ctaButton: string;
  };
  plansList: {
    title: string;
    lead: string;
    deliveryNote: string;
    viewDetail: string;
    optionsTitle: string;
    optionsLead: string;
    ctaHeading: string;
  };
  planOverlay: Record<
    PlanSlug,
    {
      name: string;
      badge?: string;
      tagline: string;
      deliveryCount: string;
      forWhom: string[];
      pricingDetail: string[];
      features: string[];
    }
  >;
  planOptionOverlay: {
    pickup: { name: string; detail: string[] };
    nomination: { name: string; detail: string[] };
    lateNight: { name: string; detail: string[] };
    location: { name: string; detail: string[] };
  };
  planDetail: {
    bookThisPlan: string;
    comingSoonNotice: string;
    comingSoonCta: string;
    priceLabel: string;
    durationLabel: string;
    deliveryLabel: string;
    includedTitle: string;
    otherPlansTitle: string;
    ctaHeadingDefault: string;
    ctaHeadingComingSoon: string;
  };
  access: {
    title: string;
    lead: string;
    areaLabel: string;
    hoursLabel: string;
    bookingLabel: string;
    bookingValue: string;
    bookingNote: string;
    mapNote: string;
    mapOpenLink: string;
    meetingTitle: string;
    meetingText: string;
    locationsKicker: string;
    locationsTitle: string;
    locationsBadge: string;
    locationsLead: string;
    locationCandidateLabel: string;
    locationMapLink: string;
    finalNoticeTitle: string;
    finalNoticeText: string;
    whyTitle: string;
    whyText: string;
    transferTitle: string;
    transferText: string;
  };
  faq: {
    title: string;
    lead: string;
    items: { q: string; a: string }[];
  };
  booking: {
    calendarToggle: string;
    optionalDetailsTitle: string;
    optionalDetailsHint: string;
    optionalDetailsFilled: string;
    shootingDetailsTitle: string;
    continueButton: string;
    participantsEstimate: string;
    quoteEstimate: string;
    groupLimitNote: string;
    groupPriceNote: string;
    breakdownAdults: string;
    breakdownChildren: string;
    breakdownGroup: string;
    breakdownPickup: string;
    breakdownNomination: string;
    breakdownCoupon: string;
    progressLabel: string;
    calendar: {
      title: string;
      previous: string;
      next: string;
      available: string;
      closed: string;
      past: string;
      closedShort: string;
      selected: string;
      note: string;
    };
    title: string;
    lead: string;
    steps: string[];
    formHeading: string;
    formSubtext: string;
    progressComplete: string;
    /** "{n}" を残り必須項目数で置換するテンプレート。formatTemplate で展開する */
    progressRemaining: string;
    missingPrefix: string;
    dateLabel: string;
    dateClosedNotice: string;
    locationsHintTitle: string;
    locationsHintText: string;
    locationsHintLink: string;
    timeWindowLabel: string;
    timeWindowHelp: string;
    timeWindows: { value: string; label: string; note: string }[];
    timeWindowNoticeTitle: string;
    timeWindowNoticeText: string;
    planLabel: string;
    planPlaceholder: string;
    planUndecided: string;
    nameLabel: string;
    namePlaceholder: string;
    participantsLabel: string;
    participantsHelp: string;
    adultsHeading: string;
    childrenHeading: string;
    male: string;
    female: string;
    boy: string;
    girl: string;
    totalLabel: string;
    participantsEmpty: string;
    participantsOver: string;
    phoneLabel: string;
    hotelLabel: string;
    hotelPlaceholder: string;
    stayLabel: string;
    stayPlaceholder: string;
    optionsLabel: string;
    pickupLabel: string;
    nominationLabel: string;
    nominationNone: string;
    nominationNote: string;
    nominationNote2: string;
    lateNightTitle: string;
    lateNightText: string;
    lateNightNote: string;
    lateNightConsent: string;
    instagramLabel: string;
    instagramPlaceholder: string;
    storyConsent: string;
    couponLabel: string;
    couponPlaceholder: string;
    couponApplied: string;
    couponQuoteOnly: string;
    couponInvalid: string;
    totalHeading: string;
    totalPlaceholder: string;
    cashOnlyNote: string;
    lateNightExcludedNote: string;
    autoSaveNote: string;
    clearButton: string;
    previewHeading: string;
    previewSubtext: string;
    copyButton: string;
    lineButton: string;
    copiedNotice: string;
    copyErrorNotice: string;
    lineFinalNote: string;
    /** "{n}" を残り必須項目数で置換するテンプレート。formatTemplate で展開する */
    stickyRemaining: string;
    stickyComplete: string;
    stickyCopy: string;
    stickyLine: string;
  };
};
