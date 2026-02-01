"use client";

import { useMemo } from "react";
import Icon from "@mdi/react";
import {
  mdiChevronLeft,
  mdiChevronRight,
} from "@mdi/js";



type Props = {
  year: number;
  month: number;
  today?: Date;
  activeDays?: number[];
  inactiveDays?: number[];
  onPrev?: () => void;
  onNext?: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function ActivityCalendar({
  year,
  month,
  today,
  activeDays = [],
  inactiveDays = [],
  onPrev,
  onNext,
}: Props) {


  const isToday = (d: number) => {
      if (!today) return false;
      return (
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        d === today.getDate()
      );
  };
  
  const { cells } = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const daysInMonth = last.getDate();
    const startWeekday = first.getDay();

    const rows = Math.ceil((startWeekday + daysInMonth) / 7);
    const total = rows * 7;
    const cells: Array<{ day: number | null; inMonth: boolean }> = [];

    for (let i = 0; i < total; i++) {
      const day = i - startWeekday + 1;
      if (day < 1 || day > daysInMonth) cells.push({ day: null, inMonth: false });
      else cells.push({ day, inMonth: true });
    }

    return { cells };
  }, [year, month]);

  const isActive = (d: number) => activeDays.includes(d);
  const isInactive = (d: number) => inactiveDays.includes(d);

  return (
    <section className="w-full rounded-2xl bg-[var(--base-color)] overflow-hidden">
      {/* month bar */}
      <div className="bg-[var(--accent-color)] px-4 py-2 flex items-center justify-between">
        <p className="text-lg text-[var(--text-color)] font-semibold">
          {year}/{String(month).padStart(2, "0")}
        </p>

        {(onPrev || onNext) && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrev}
              className="p-1 text-xl leading-none px-2 transition active:scale-90"
              aria-label="prev month"
            >
              <Icon path={mdiChevronLeft} size={1.2} />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-1 text-xl font-semibold leading-none transition active:scale-90"
              aria-label="next month"
            >
              <Icon path={mdiChevronRight} size={1.2} />
            </button>
          </div>
        )}
      </div>

      {/* body */}
      <div className="px-2 pt-3 pb-2">
        {/* weekday */}
        <div className="grid grid-cols-7 text-center text-sm text-[var(--text-color)] mb-2">
          {WEEKDAYS.map((w) => (
            <div key={w}>
              {w}
            </div>
          ))}
        </div>

        {/* cells */}
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {cells.map((cell, idx) => {
            const d = cell.day;

            if (!cell.inMonth || d == null) {
              return (
                <div key={idx} className="flex justify-center">
                  <div className="h-10 w-10 rounded-full" />
                </div>
              );
            }

            const active = isActive(d);
            const inactive = isInactive(d);
            const todayText = isToday(d) ? "!text-[var(--text-color)] font-bold" : "";

            const cls =
              active
                ? `bg-[#14B37D] text-white ${todayText}`
                : inactive
                ? `bg-[#D9D9D9] text-white ${todayText}`
                : `text-[var(--text-color)] ${todayText}`;

            return (
              <div key={idx} className="flex justify-center">
                <button
                  type="button"
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm ${cls}`}
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
