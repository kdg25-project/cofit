"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useMemo } from "react";

type Props = {
	year: number;
	month: number;
	today?: Date;
	activeDays?: number[];
	onPrev?: () => void;
	onNext?: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function ActivityCalendar({
	year,
	month,
	today,
	activeDays = [],
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
			if (day < 1 || day > daysInMonth)
				cells.push({ day: null, inMonth: false });
			else cells.push({ day, inMonth: true });
		}

		return { cells };
	}, [year, month]);

	const isActive = (d: number) => activeDays.includes(d);

	return (
		<section className="w-full rounded-2xl bg-base overflow-hidden">
			{/* month bar */}
			<div className="bg-accent px-4 py-2 flex items-center justify-between">
				<p className="text-lg text-text font-semibold">
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
							<ChevronLeftIcon fontSize="medium" />
						</button>
						<button
							type="button"
							onClick={onNext}
							className="p-1 text-xl font-semibold leading-none transition active:scale-90"
							aria-label="next month"
						>
							<ChevronRightIcon fontSize="medium" />
						</button>
					</div>
				)}
			</div>

			{/* body */}
			<div className="px-2 pt-3 pb-2">
				{/* weekday */}
				<div className="grid grid-cols-7 text-center text-sm text-text mb-2">
					{WEEKDAYS.map((w) => (
						<div key={w}>{w}</div>
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
						const todayText = isToday(d) ? "!text-text font-bold" : "";

						const cls = active
							? `bg-[#14B37D] text-white ${todayText}`
							: `text-text  ${todayText}`;

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
