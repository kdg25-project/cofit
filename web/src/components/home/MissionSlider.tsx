"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMissions, type MissionRow } from "@/api/mission";
import { MissionProgressRing } from "./MissionProgressRing";
import { SlideDots } from "./SlideDots";

type Props = {
	today: Date;
	exerciseLabel: string;
	streak?: number;
	autoMs?: number;
};

type Progress = { value: number; max: number };

function labelToMode(label: string): MissionRow["mode"] {
	if (label.includes("スクワット")) return "squat";
	if (label.includes("腕立て")) return "pushup";
	if (label.includes("腹筋")) return "situp";
	return "squat";
}

export function MissionSlider({
	today,
	exerciseLabel,
	streak = 0,
	autoMs = 3500,
}: Props) {
	const [active, setActive] = useState(0);

	const [progresses, setProgresses] = useState<Progress[]>([
		{ value: 0, max: 1 },
		{ value: 0, max: 1 },
		{ value: 0, max: 1 },
	]);

	const [loading, setLoading] = useState(true);

	const pauseUntilRef = useRef<number>(0);
	const pause = (ms = 6000) => {
		pauseUntilRef.current = Date.now() + ms;
	};

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				const mode = labelToMode(exerciseLabel);
				const all = await fetchMissions();

				if (all.length === 0) {
					setProgresses([
						{ value: 0, max: 100 },
						{ value: 0, max: 7 },
						{ value: 0, max: 30 },
					]);
					return;
				}

				const basePartyId = all[0]?.partyId ?? null;
				const missions = basePartyId
					? all.filter((m) => m.partyId === basePartyId)
					: all;

				const pick = (type: MissionRow["type"]) => {
					const m = missions.find((x) => x.type === type && x.mode === mode);
					return {
						value: m?.currentCount ?? 0,
						max: Math.max(1, m?.goalCount ?? 1),
					};
				};

				setProgresses([pick("daily"), pick("weekly"), pick("monthly")]);
			} catch (e) {
				console.error(e);
				setProgresses([
					{ value: 0, max: 1 },
					{ value: 0, max: 1 },
					{ value: 0, max: 1 },
				]);
			} finally {
				setLoading(false);
			}
		})();
	}, [exerciseLabel, today]);

	useEffect(() => {
		if (autoMs <= 0) return;

		const id = window.setInterval(() => {
			if (Date.now() < pauseUntilRef.current) return;
			setActive((prev) => (prev + 1) % progresses.length);
		}, autoMs);

		return () => window.clearInterval(id);
	}, [autoMs, progresses.length]);

	const p = progresses[active];

	const dateLabel = useMemo(() => {
		const m = today.getMonth() + 1;
		const d = today.getDate();

		if (active === 0) return `${m}/${d}`;

		if (active === 1) {
			const start = new Date(today);
			const end = new Date(today);

			const dow = today.getDay(); // 0=Sun
			start.setDate(d - dow);
			end.setDate(start.getDate() + 6);

			const sm = start.getMonth() + 1;
			const sd = start.getDate();
			const em = end.getMonth() + 1;
			const ed = end.getDate();

			return sm === em ? `${sm}/${sd}〜${ed}` : `${sm}/${sd}〜${em}/${ed}`;
		}

		if (active === 2) {
			const start = new Date(today.getFullYear(), today.getMonth(), 1);
			const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			const mm = start.getMonth() + 1;
			return `${mm}/1〜${end.getDate()}`;
		}

		return "";
	}, [active, today]);

	return (
		<div className="relative rounded-3xl bg-transparent">
			<div className="absolute top-0 left-0 text-[18px] font-medium text-text">
				{dateLabel}
			</div>

			<div className="absolute right-0 top-0">
				<div className="rounded-full bg-base px-3 py-2 shadow-sm flex items-center gap-1">
					<span>🔥</span>
					<span className="text-base">{streak}</span>
				</div>
			</div>

			<MissionProgressRing
				label={loading ? "読み込み中" : exerciseLabel}
				value={p.value}
				max={p.max}
			/>

			<SlideDots
				count={progresses.length}
				activeIndex={active}
				onDotClick={(i) => {
					pause();
					setActive(i);
				}}
			/>
		</div>
	);
}
