"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useMemo, useState } from "react";

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
	const MOCK_RECORD_DAY = 19;
	const [selectedDay, setSelectedDay] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);

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

	const isActive = (d: number) =>
		activeDays.includes(d) || d === MOCK_RECORD_DAY;
	const hasRecord =
		selectedDay != null &&
		(activeDays.includes(selectedDay) || selectedDay === MOCK_RECORD_DAY);
	const dateLabel =
		selectedDay == null
			? ""
			: `${year}/${String(month).padStart(2, "0")}/${String(
					selectedDay,
				).padStart(2, "0")}`;

	const demoRecords = [
		{ time: "10:00 - 10:30", exercise: "スクワット", reps: 50 },
	];

	return (
		<>
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
										onClick={() => {
											setSelectedDay(d);
											setIsOpen(true);
										}}
									>
										{d}
									</button>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{isOpen && selectedDay != null ? (
				<div className="fixed inset-0 z-[60]">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						onClick={() => setIsOpen(false)}
						aria-label="閉じる"
					/>
					<div className="absolute inset-x-0 bottom-0">
						<div className="mx-auto w-full max-w-[420px] rounded-t-[20px] bg-base px-6 pt-5 pb-[calc(28px+env(safe-area-inset-bottom))] shadow-2xl">
							<div className="flex items-center justify-center relative">
								<h2 className="text-xl text-text">{dateLabel}</h2>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="absolute right-0 h-8 w-8 rounded-full flex items-center justify-center text-text"
									aria-label="閉じる"
								>
									<CloseRoundedIcon sx={{ fontSize: 28 }} />
								</button>
							</div>

							{hasRecord ? (
								<>
									<div className="mt-5 grid grid-cols-[64px_1fr_1fr] gap-y-3 text-text">
										<div />
										<div className="text-center text-sm">合計</div>
										<div className="text-center text-sm">平均</div>
										<div className="text-lg">回数</div>
										<div className="text-lg text-left">1</div>
										<div className="text-lg text-left">1</div>
										<div className="text-lg">時間</div>
										<div className="text-center text-sub">00:30:00</div>
										<div className="text-center text-sub">00:30:00</div>
									</div>

									<div className="mt-5 space-y-3">
										{demoRecords.map((record, i) => (
											<div
												key={`${record.time}-${i}`}
												className="w-full rounded-2xl border border-sub bg-base px-4 py-3 flex items-center gap-6 shadow-sm"
											>
												<div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
													<div className="h-8 w-8 rounded-full bg-primary" />
												</div>
												<div className="text-left">
													<div className="text-sm text-text">{record.time}</div>
													<div className="text-sub text-lg">
														{record.exercise}{" "}
														<span className="font-semibold">
															{record.reps}回
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</>
							) : (
								<p className="mt-6 text-center text-[16px] text-placeholder">
									運動記録がありません。
								</p>
							)}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
