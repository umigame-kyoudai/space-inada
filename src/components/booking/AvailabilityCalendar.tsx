"use client";

import { useMemo } from "react";
import {
  AVAILABILITY_YEAR,
  getTodayInJapanDateKey,
  isFullMoonClosureDate,
  isSelectableBookingDate,
} from "@/data/availability";

import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { LOCALE_HTML_LANG, type Locale } from "@/lib/i18n/locales";
import { formatTemplate } from "@/lib/i18n/format";

const JAPANESE_LABELS: Dictionary["booking"]["calendar"] = {
  title: "カレンダーから日付を選択",
  previous: "前の月を表示",
  next: "次の月を表示",
  available: "受付可能",
  closed: "受付不可（撮影休止日）",
  past: "受付終了",
  selected: "選択中：{date}",
  selectPrompt: "○の日をタップして選択してください",
  note: "満月期間の撮影休止日を反映しています。実際の空き状況と天候による撮影可否は、LINEで確認後に確定します。",
};

type Props = {
  labels?: Dictionary["booking"]["calendar"];
  locale?: Locale;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  monthIndex: number;
  onMonthChange: (monthIndex: number) => void;
};

function dateKey(monthIndex: number, day: number): string {
  return `${AVAILABILITY_YEAR}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AvailabilityCalendar({
  labels = JAPANESE_LABELS,
  locale,
  selectedDate,
  onSelectDate,
  monthIndex,
  onMonthChange,
}: Props) {
  const today = useMemo(() => getTodayInJapanDateKey(), []);

  const language = locale ? LOCALE_HTML_LANG[locale] : "ja-JP";
  const monthFormatter = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const dateFormatter = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });
  const weekdayFormatter = new Intl.DateTimeFormat(language, {
    weekday: "short",
    timeZone: "UTC",
  });
  const monthLabel = monthFormatter.format(
    new Date(Date.UTC(AVAILABILITY_YEAR, monthIndex, 1)),
  );
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayFormatter.format(new Date(Date.UTC(2026, 0, 4 + i))),
  );

  const firstWeekday = new Date(AVAILABILITY_YEAR, monthIndex, 1).getDay();
  const daysInMonth = new Date(AVAILABILITY_YEAR, monthIndex + 1, 0).getDate();
  const firstAvailableMonth = today.startsWith(`${AVAILABILITY_YEAR}-`)
    ? Number(today.slice(5, 7)) - 1
    : 0;
  const hasValidSelection = isSelectableBookingDate(selectedDate, today);

  return (
    <section
      aria-labelledby="availability-calendar-title"
      className="w-full min-w-0 max-w-full rounded-xl border border-line bg-white p-2 sm:p-4"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(Math.max(firstAvailableMonth, monthIndex - 1))}
          disabled={monthIndex <= firstAvailableMonth}
          aria-label={labels.previous}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-mist text-xl text-accent transition-colors hover:border-line disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <div className="min-w-0 text-center">
          <p
            id="availability-calendar-title"
            className="text-[11px] text-muted"
          >
            {labels.title}
          </p>
          <p aria-live="polite" className="mt-0.5 text-base font-bold text-ink">
            {monthLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(Math.min(11, monthIndex + 1))}
          disabled={monthIndex === 11}
          aria-label={labels.next}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-mist text-xl text-accent transition-colors hover:border-line disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-7 gap-1">
        {weekdays.map((weekday, index) => (
          <div
            key={weekday}
            aria-hidden="true"
            className={`pb-1 text-center text-[10px] font-semibold ${
              index === 0
                ? "text-rose-700"
                : index === 6
                  ? "text-sky-700"
                  : "text-muted"
            }`}
          >
            {weekday}
          </div>
        ))}

        {Array.from({ length: firstWeekday }, (_, index) => (
          <div key={`blank-${index}`} aria-hidden className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const value = dateKey(monthIndex, day);
          const isPast = value < today;
          const isClosed = isFullMoonClosureDate(value);
          const isSelected = value === selectedDate;
          const isToday = value === today;
          const disabled = isPast || isClosed;
          const isSelectableSelected = isSelected && !disabled;
          const status = isPast
            ? labels.past
            : isClosed
              ? labels.closed
              : labels.available;

          return (
            <button
              key={value}
              data-date={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(value)}
              aria-label={`${dateFormatter.format(new Date(Date.UTC(AVAILABILITY_YEAR, monthIndex, day)))} ${status}`}
              aria-pressed={isSelectableSelected}
              aria-current={isToday ? "date" : undefined}
              title={status}
              className={`relative flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm ${
                isSelectableSelected
                  ? "border-accent bg-accent text-on-accent"
                  : isPast
                    ? "cursor-not-allowed border-transparent bg-mist text-muted/60"
                    : isClosed
                      ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-accent hover:bg-emerald-100"
              } ${isToday && !isSelectableSelected ? "ring-1 ring-inset ring-accent" : ""}`}
            >
              <span>{day}</span>
              <span aria-hidden="true" className="text-[11px] leading-none">
                {isSelectableSelected ? "✓" : isPast ? "—" : isClosed ? "×" : "○"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="font-bold text-emerald-800">○</span>
          {labels.available}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="font-bold text-rose-700">×</span>
          {labels.closed}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">—</span>
          {labels.past}
        </span>
      </div>

      <p aria-live="polite" className="mt-3 rounded-lg bg-mist px-3 py-2.5 text-xs font-semibold text-accent">
        {hasValidSelection
          ? formatTemplate(labels.selected, {
              date: dateFormatter.format(new Date(`${selectedDate}T00:00:00Z`)),
            })
          : labels.selectPrompt}
      </p>

      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        {labels.note}
      </p>
    </section>
  );
}
