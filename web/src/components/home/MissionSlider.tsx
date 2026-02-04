"use client";

import { InferResponseType } from "hono/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { client } from "@/lib/hono-client";
import { MissionProgressRing } from "./MissionProgressRing";
import { SlideDots } from "./SlideDots";

type Props = {
	today: Date;
	streak?: number;
	autoMs?: number;
};

type MissionsResponse = InferResponseType<typeof client.api.missions.$get>;
type Progress = Extract<MissionsResponse, unknown[]>[number];

export function MissionSlider({ today, streak = 0, autoMs = 3500 }: Props) {
	const [active, setActive] = useState(0);

	const [progresses, setProgresses] = useState<Progress[]>([]);

	const [loading, setLoading] = useState(true);

	const pauseUntilRef = useRef<number>(0);
	const pause = (ms = 6000) => {
		pauseUntilRef.current = Date.now() + ms;
	};

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await client.api.missions.$get(); // GET https://api-cofit.kdgn.tech/api/missions
				const data = await res.json();
				if (res.ok && Array.isArray(data)) {
					setProgresses(data);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		})();
	}, [today]);

	useEffect(() => {
		if (autoMs <= 0) return;

		const id = window.setInterval(() => {
			if (Date.now() < pauseUntilRef.current) return;
			if (progresses.length > 0) {
				setActive((prev) => (prev + 1) % progresses.length);
			}
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
				label={
					loading ? "読み込み中" : (p?.title.split(" ")[0] ?? "ミッション")
				}
				value={p?.currentCount ?? 0}
				max={p?.goalCount ?? 1}
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
