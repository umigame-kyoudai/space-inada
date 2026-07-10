"use client";

import { useReportWebVitals } from "next/web-vitals";
import { gaPush, isGaEnabled } from "@/lib/analytics";

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]> extends [
  infer M,
]
  ? M
  : never;

/**
 * Core Web Vitals（LCP / CLS / INP / FCP / TTFB）の実ユーザー計測を GA4 に送る。
 * gtag.js のロード前でも取りこぼさないよう dataLayer へ直接 push する（gaPush）。
 * イベント名 = 指標名（LCP など）。GA4 の探索レポートで metric_rating 別に集計できる。
 */
function sendToGa(metric: Metric) {
  if (!isGaEnabled()) return;
  gaPush("event", metric.name, {
    // GA4 の value は整数が扱いやすい。CLS はスコアが小さいので1000倍する定石
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    non_interaction: true,
  });
}

export function WebVitals() {
  useReportWebVitals(sendToGa);
  return null;
}
