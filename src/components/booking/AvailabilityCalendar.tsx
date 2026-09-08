"use client";

import { useMemo } from "react";
import {
  AVAILABILITY_YEAR,
  getTodayInJapanDateKey,
  isFullMoonClosureDate,
} from "@/data/availability";

import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { LOCALE_HTML_LANG, type Locale } from "@/lib/i18n/locales";
import { formatTemplate } from "@/lib/i18n/format";

const JAPANESE_LABELS: Dictionary["booking"]["calendar"] = {
  title: "撮影可能日カレンダー",
  previous: "前の月を表示",
  next: "次の月を表示",
  available: "月齢上は受付可能",
  closed: "満月期間のため撮影休止",
  past: "受付終了",
  closedShort: "休止",
  selected: "選択中：{date}",
  note: "満月期間による休止日を表示しています。実際の空き状況と天候による撮影可否は、LINEで確認後に確定します。",
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
    month: "long",
    day: "numeric",
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

  return (
    <section
      aria-labelledby="availability-calendar-title"
      className="mt-3 rounded-xl border border-line bg-white p-3 sm:p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMonthChange(Math.max(0, monthIndex - 1))}
          disabled={monthIndex === 0}
          aria-label={labels.previous}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-mist text-xl text-accent transition-colors hover:border-line disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <div className="text-center">
          <p
            id="availability-calendar-title"
            className="text-sm font-bold text-ink"
          >
            {labels.title}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-accent">
            {monthLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(Math.min(11, monthIndex + 1))}
          disabled={monthIndex === 11}
          aria-label={labels.next}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-mist text-xl text-accent transition-colors hover:border-line disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
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
          const status = isClosed
            ? labels.closed
            : isPast
              ? labels.past
              : labels.available;

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(value)}
              aria-label={`${dateFormatter.format(new Date(Date.UTC(AVAILABILITY_YEAR, monthIndex, day)))} ${status}`}
              aria-pressed={isSelectableSelected}
              title={status}
              className={`relative flex min-h-11 min-w-0 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-colors sm:text-sm ${
                isSelectableSelected
                  ? "border-line bg-accent text-on-accent shadow-none"
                  : isClosed
                    ? "cursor-not-allowed border-rose-300/20 bg-rose-500/10 text-rose-700"
                    : isPast
                      ? "cursor-not-allowed border-transparent bg-mist text-muted"
                      : "border-line bg-mist text-ink hover:border-line hover:bg-mist"
              } ${isToday && !isSelectableSelected ? "ring-1 ring-inset ring-accent" : ""}`}
            >
              <span className={isClosed ? "line-through" : ""}>{day}</span>
              {isClosed && (
                <span className="mt-0.5 text-[8px] leading-none">
                  {labels.closedShort}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-line bg-mist" />
          {labels.available}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-rose-300/30 bg-rose-500/15" />
          {labels.closed}
        </span>
      </div>

      {selectedDate && selectedDate.startsWith(`${AVAILABILITY_YEAR}-`) && (
        <p className="mt-3 rounded-lg border border-line bg-mist px-3 py-2 text-xs text-accent">
          {formatTemplate(labels.selected, {
            date: dateFormatter.format(new Date(`${selectedDate}T00:00:00Z`)),
          })}
        </p>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        {labels.note}
      </p>
    </section>
  );
}
