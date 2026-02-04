"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { client } from "@/lib/hono-client";

type Props = {
	year: number;
	month: number;
	today?: Date;
	activeDays?: number[];
	onPrev?: () => void;
	onNext?: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type ActivityRecord = {
	activity: string;
	count: number;
	timeRange: string;
	startTime: string;
	endTime: string;
};

const USE_MOCK_ACTIVITY = true;

const EXERCISE_META: Record<string, { label: string; image: string }> = {
	squat: { label: "スクワット", image: "/squat.png" },
	pushup: { label: "腕立て伏せ", image: "/pushup.png" },
	situp: { label: "腹筋", image: "/squat.png" },
};

function pad2(n: number) {
	return String(n).padStart(2, "0");
}

function formatHMS(totalSec: number) {
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = Math.max(0, totalSec % 60);
	return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function toIso(
	year: number,
	month: number,
	day: number,
	hour: number,
	min: number,
) {
	return new Date(year, month - 1, day, hour, min, 0).toISOString();
}

function getMockDayRecords(
	year: number,
	month: number,
): Record<string, ActivityRecord[]> {
	const ymd = (day: number) => `${year}-${pad2(month)}-${pad2(day)}`;

	return {
		[ymd(3)]: [
			{
				activity: "squat",
				count: 35,
				timeRange: "07:10 - 07:25",
				startTime: toIso(year, month, 3, 7, 10),
				endTime: toIso(year, month, 3, 7, 25),
			},
		],
		[ymd(8)]: [
			{
				activity: "pushup",
				count: 24,
				timeRange: "12:10 - 12:30",
				startTime: toIso(year, month, 8, 12, 10),
				endTime: toIso(year, month, 8, 12, 30),
			},
		],
		[ymd(13)]: [
			{
				activity: "squat",
				count: 42,
				timeRange: "19:00 - 19:20",
				startTime: toIso(year, month, 13, 19, 0),
				endTime: toIso(year, month, 13, 19, 20),
			},
			{
				activity: "pushup",
				count: 18,
				timeRange: "19:25 - 19:35",
				startTime: toIso(year, month, 13, 19, 25),
				endTime: toIso(year, month, 13, 19, 35),
			},
		],
		[ymd(19)]: [
			{
				activity: "squat",
				count: 50,
				timeRange: "10:00 - 10:30",
				startTime: toIso(year, month, 19, 10, 0),
				endTime: toIso(year, month, 19, 10, 30),
			},
		],
		[ymd(24)]: [
			{
				activity: "pushup",
				count: 20,
				timeRange: "21:00 - 21:12",
				startTime: toIso(year, month, 24, 21, 0),
				endTime: toIso(year, month, 24, 21, 12),
			},
		],
	};
}

export function ActivityCalendar({
	year,
	month,
	today,
	activeDays = [],
	onPrev,
	onNext,
}: Props) {
	const [selectedDay, setSelectedDay] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [dayRecords, setDayRecords] = useState<ActivityRecord[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const mockDayRecords = useMemo(
		() => getMockDayRecords(year, month),
		[year, month],
	);
	const mergedActiveDays = useMemo(() => {
		if (!USE_MOCK_ACTIVITY) return activeDays;
		const mockDays = Object.keys(mockDayRecords).map((k) =>
			Number(k.split("-")[2]),
		);
		return Array.from(new Set([...activeDays, ...mockDays]));
	}, [activeDays, mockDayRecords]);

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

	const isActive = (d: number) => mergedActiveDays.includes(d);
	const hasRecord = dayRecords.length > 0;
	const dateLabel =
		selectedDay == null
			? ""
			: `${year}/${String(month).padStart(2, "0")}/${String(
					selectedDay,
				).padStart(2, "0")}`;

	useEffect(() => {
		if (!isOpen || selectedDay == null) return;

		const dateStr = `${year}-${pad2(month)}-${pad2(selectedDay)}`;
		if (USE_MOCK_ACTIVITY && mockDayRecords[dateStr]) {
			setIsLoading(false);
			setLoadError(null);
			setDayRecords(mockDayRecords[dateStr]);
			return;
		}

		let isCancelled = false;
		setIsLoading(true);
		setLoadError(null);

		(async () => {
			try {
				const res = await client.api.missions.activities.summary.$get({
					query: { date: dateStr },
				});
				if (!res.ok) {
					const errorText = await res.text();
					if (!isCancelled) {
						setLoadError(errorText || "読み込みに失敗しました");
						setDayRecords([]);
					}
					return;
				}

				const data = await res.json();
				if (!isCancelled) {
					if (data && Array.isArray(data.activities)) {
						setDayRecords(data.activities);
					} else {
						setDayRecords([]);
					}
				}
			} catch (_e) {
				if (!isCancelled) {
					setLoadError("通信エラーが発生しました");
					setDayRecords([]);
				}
			} finally {
				if (!isCancelled) setIsLoading(false);
			}
		})();

		return () => {
			isCancelled = true;
		};
	}, [isOpen, selectedDay, year, month, mockDayRecords]);

	const { totalReps, avgReps, totalSec, avgSec } = useMemo(() => {
		if (dayRecords.length === 0) {
			return { totalReps: 0, avgReps: 0, totalSec: 0, avgSec: 0 };
		}

		let totalReps = 0;
		let totalSec = 0;
		for (const r of dayRecords) {
			totalReps += Number(r.count || 0);
			const startMs = new Date(r.startTime).getTime();
			const endMs = new Date(r.endTime).getTime();
			if (Number.isFinite(startMs) && Number.isFinite(endMs)) {
				const sec = Math.max(0, Math.round((endMs - startMs) / 1000));
				totalSec += sec;
			}
		}

		const avgReps = Math.round(totalReps / dayRecords.length);
		const avgSec = Math.round(totalSec / dayRecords.length);

		return { totalReps, avgReps, totalSec, avgSec };
	}, [dayRecords]);

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

							{isLoading ? (
								<p className="mt-6 text-center text-[16px] text-placeholder">
									読み込み中...
								</p>
							) : hasRecord ? (
								<>
									<div className="mt-5 grid grid-cols-[70px_1fr_1fr] gap-y-3 text-text">
										<div />
										<div className="text-left text-sm">合計</div>
										<div className="text-left text-sm">平均</div>
										<div className="text-lg text-left">回数</div>
										<div className="text-lg text-left">{totalReps}</div>
										<div className="text-lg text-left">{avgReps}</div>
										<div className="text-lg text-left">時間</div>
										<div className="text-left text-sub">
											{formatHMS(totalSec)}
										</div>
										<div className="text-left text-sub">
											{formatHMS(avgSec)}
										</div>
									</div>

									<div className="mt-5 space-y-3">
										{dayRecords.map((record, i) => {
											const meta = EXERCISE_META[record.activity] ?? {
												label: "エクササイズ",
												image: "/squat.png",
											};

											return (
												<div
													key={`${record.timeRange}-${i}`}
													className="w-full rounded-2xl border border-sub bg-base px-10 py-3 flex items-center gap-10 shadow-sm"
												>
													<div className="flex items-center justify-center overflow-hidden">
														<Image
															src={meta.image}
															alt={meta.label}
															width={48}
															height={48}
															className="h-12 w-12 rounded-full object-cover"
														/>
													</div>

													<div className="text-left">
														<div className="text-sm text-text">
															{record.timeRange}
														</div>
														<div className="text-sub text-lg">
															{meta.label}{" "}
															<span className="font-semibold">
																{record.count}回
															</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</>
							) : (
								<div className="mt-6 text-center text-[16px] text-placeholder">
									<p>運動記録がありません。</p>
									{loadError ? (
										<p className="mt-2 text-sm">{loadError}</p>
									) : null}
								</div>
							)}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
