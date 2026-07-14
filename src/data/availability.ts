export const AVAILABILITY_YEAR = 2026;

/** 2026年の満月期間による撮影休止日（ユーザー確定値）。 */
export const FULL_MOON_CLOSURE_RANGES_2026 = [
  { month: 1, ranges: [[27, 31]] },
  { month: 2, ranges: [[1, 2], [24, 28]] },
  { month: 3, ranges: [[1, 4], [25, 31]] },
  { month: 4, ranges: [[1, 3], [25, 30]] },
  { month: 5, ranges: [[1, 3], [27, 31]] },
  { month: 6, ranges: [[1, 1], [26, 30]] },
  { month: 7, ranges: [[26, 30]] },
  { month: 8, ranges: [[24, 30]] },
  { month: 9, ranges: [[23, 28]] },
  { month: 10, ranges: [[22, 27]] },
  { month: 11, ranges: [[21, 25]] },
  { month: 12, ranges: [[20, 26]] },
] as const;

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const fullMoonClosureDates = new Set(
  FULL_MOON_CLOSURE_RANGES_2026.flatMap(({ month, ranges }) =>
    ranges.flatMap(([start, end]) =>
      Array.from({ length: end - start + 1 }, (_, index) =>
        dateKey(AVAILABILITY_YEAR, month, start + index),
      ),
    ),
  ),
);

export function isFullMoonClosureDate(value: string): boolean {
  return fullMoonClosureDates.has(value);
}

/** 日本時間の今日を YYYY-MM-DD で返す。 */
export function getTodayInJapanDateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
