"use client";

import { useMemo } from "react";

type Props = {
  year: number;          // 2026
  month: number;         // 1〜12
  activeDays?: number[]; // 達成した日（当月の1〜31）
  inactiveDays?: number[]; // 無効/休みの日（当月の1〜31）
  onPrev?: () => void;
  onNext?: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function ActivityCalendar({
  year,
  month,
  activeDays = [],
  inactiveDays = [],
  onPrev,
  onNext,
}: Props) {
  const { cells } = useMemo(() => {
    // JS Date の month は 0-index
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0); // 当月末日
    const daysInMonth = last.getDate();
    const startWeekday = first.getDay(); // 0=日

    // 6週分(42セル)作る（UI安定）
    const total = 42;
    const cells: Array<{ day: number | null; inMonth: boolean }> = [];

    for (let i = 0; i < total; i++) {
      const day = i - startWeekday + 1;
      if (day < 1 || day > daysInMonth) {
        cells.push({ day: null, inMonth: false });
      } else {
        cells.push({ day, inMonth: true });
      }
    }

    return { cells };
  }, [year, month]);

  const isActive = (d: number) => activeDays.includes(d);
  const isInactive = (d: number) => inactiveDays.includes(d);

  return (
    <section className="rounded-3xl bg-white shadow-sm overflow-hidden border border-black/5">
      {/* month bar */}
      <div className="bg-[#78C9A5] px-4 py-3 flex items-center justify-between">
        <p className="font-semibold text-black">
          {year}/{String(month).padStart(2, "0")}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onPrev}
            className="text-black/70 text-xl leading-none px-2"
            aria-label="prev month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            className="text-black text-xl font-semibold leading-none px-2"
            aria-label="next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* body */}
      <div className="px-4 py-4">
        {/* weekday */}
        <div className="grid grid-cols-7 text-center text-sm text-black/70 mb-3">
          {WEEKDAYS.map((w) => (
            <div key={w} className="font-semibold">
              {w}
            </div>
          ))}
        </div>

        {/* cells */}
        <div className="grid grid-cols-7 gap-y-3 text-center">
          {cells.map((cell, idx) => {
            const d = cell.day;

            // 空セル
            if (!cell.inMonth || d == null) {
              return (
                <div key={idx} className="flex justify-center">
                  <div className="h-11 w-11 rounded-full" />
                </div>
              );
            }

            const active = isActive(d);
            const inactive = isInactive(d);

            const cls =
              active
                ? "bg-[#14B37D] text-white"
                : inactive
                ? "bg-[#D9D9D9] text-white"
                : "text-black";

            return (
              <div key={idx} className="flex justify-center">
                <button
                  type="button"
                  className={`h-11 w-11 rounded-full flex items-center justify-center font-semibold ${cls}`}
                  aria-label={`${year}-${month}-${d}`}
                >
                  {d}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
