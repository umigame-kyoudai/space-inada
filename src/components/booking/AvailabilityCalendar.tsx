"use client";

import { useMemo } from "react";
import {
  AVAILABILITY_YEAR,
  getTodayInJapanDateKey,
  isFullMoonClosureDate,
} from "@/data/availability";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  monthIndex: number;
  onMonthChange: (monthIndex: number) => void;
};

function dateKey(monthIndex: number, day: number): string {
  return `${AVAILABILITY_YEAR}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatJapaneseDate(value: string): string {
  const [, month, day] = value.split("-").map(Number);
  return `${month}月${day}日`;
}

export function AvailabilityCalendar({
  selectedDate,
  onSelectDate,
  monthIndex,
  onMonthChange,
}: Props) {
  const today = useMemo(() => getTodayInJapanDateKey(), []);

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
          aria-label="前の月を表示"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-mist text-xl text-accent transition-colors hover:border-line disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <div className="text-center">
          <p id="availability-calendar-title" className="text-sm font-bold text-ink">
            撮影可能日カレンダー
          </p>
          <p className="mt-0.5 text-xs font-semibold text-accent">
            {AVAILABILITY_YEAR}年{monthIndex + 1}月
          </p>
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(Math.min(11, monthIndex + 1))}
          disabled={monthIndex === 11}
          aria-label="次の月を表示"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-mist text-xl text-accent transition-colors hover:border-line disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1" role="grid" aria-label={`${AVAILABILITY_YEAR}年${monthIndex + 1}月`}>
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={weekday}
            role="columnheader"
            className={`pb-1 text-center text-[10px] font-semibold ${
              index === 0 ? "text-rose-700" : index === 6 ? "text-sky-700" : "text-muted"
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
            ? "満月期間のため撮影休止"
            : isPast
              ? "受付終了"
              : "月齢上は受付可能";

          return (
            <button
              key={value}
              type="button"
              role="gridcell"
              disabled={disabled}
              onClick={() => onSelectDate(value)}
              aria-label={`${monthIndex + 1}月${day}日 ${status}`}
              aria-selected={isSelectableSelected}
              title={status}
              className={`relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-colors sm:text-sm ${
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
              {isClosed && <span className="mt-0.5 text-[8px] leading-none">休止</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-line bg-mist" />
          月齢上は受付可能
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-rose-300/30 bg-rose-500/15" />
          満月期間・撮影休止
        </span>
      </div>

      {selectedDate && selectedDate.startsWith(`${AVAILABILITY_YEAR}-`) && (
        <p className="mt-3 rounded-lg border border-line bg-mist px-3 py-2 text-xs text-accent">
          選択中：{formatJapaneseDate(selectedDate)}
        </p>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        ※この表示は満月期間による休止日を反映したものです。実際の空き状況と天候による撮影可否は、LINEでの確認後に確定します。
      </p>
    </section>
  );
}
