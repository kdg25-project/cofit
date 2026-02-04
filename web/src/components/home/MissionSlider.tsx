"use client";

import { InferResponseType } from "hono/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

	const scrollRef = useRef<HTMLDivElement>(null);
	const pauseUntilRef = useRef<number>(0);
	const pause = useCallback((ms = 6000) => {
		pauseUntilRef.current = Date.now() + ms;
	}, []);

	const handleScroll = () => {
		if (!scrollRef.current) return;
		const { scrollLeft, offsetWidth } = scrollRef.current;
		if (offsetWidth === 0) return;
		const index = Math.round(scrollLeft / offsetWidth);
		if (index !== active && index >= 0 && index < progresses.length) {
			setActive(index);
		}
	};

	const goToIndex = useCallback(
		(i: number) => {
			if (!scrollRef.current) return;
			const width = scrollRef.current.offsetWidth;
			scrollRef.current.scrollTo({
				left: width * i,
				behavior: "smooth",
			});
			setActive(i);
			pause();
		},
		[pause],
	);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await client.api.missions.$get();
				const data = await res.json();
				if (res.ok && Array.isArray(data)) {
					setProgresses(data);
				}
			} catch (e) {
				console.error("[MissionSlider] Fetch error:", e);
			} finally {
				setLoading(false);
			}
		})();
	}, [today]);

	// オートスライド
	useEffect(() => {
		if (autoMs <= 0 || progresses.length <= 1) return;

		const id = window.setInterval(() => {
			if (Date.now() < pauseUntilRef.current) return;
			const next = (active + 1) % progresses.length;
			goToIndex(next);
		}, autoMs);

		return () => window.clearInterval(id);
	}, [autoMs, progresses.length, active, goToIndex]);

	const dateLabel = useMemo(() => {
		const m = today.getMonth() + 1;
		const d = today.getDate();

		if (active === 0) return `${m}/${d}`;

		if (active === 1) {
			const start = new Date(today);
			const end = new Date(today);
			const dow = today.getDay();
			start.setDate(d - dow);
			end.setDate(start.getDate() + 6);
			const sm = start.getMonth() + 1;
			const sd = start.getDate();
			const em = end.getMonth() + 1;
			const ed = end.getDate();
			return sm === em ? `${sm}/${sd}〜${ed}` : `${sm}/${sd}〜${em}/${ed}`;
		}

		if (active === 2) {
			const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			const mm = today.getMonth() + 1;
			return `${mm}/1〜${end.getDate()}`;
		}

		return "";
	}, [active, today]);

	return (
		<div className="relative rounded-3xl bg-transparent">
			{/* ヘッダー情報 */}
			<div className="absolute top-0 left-0 text-[18px] font-medium text-text z-10">
				{dateLabel}
			</div>

			{streak > 0 && (
				<div className="absolute right-0 top-0 z-10">
					<div className="rounded-full bg-base px-3 py-2 shadow-sm flex items-center gap-1">
						<span>🔥</span>
						<span className="bg-text">{streak}</span>
					</div>
				</div>
			)}

			{/* スクロールコンテナ */}
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				onTouchStart={() => pause()}
				className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide no-scrollbar"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{loading ? (
					<div className="w-full shrink-0 snap-center">
						<MissionProgressRing label="読み込み中" value={0} max={1} />
					</div>
				) : progresses.length > 0 ? (
					progresses.map((p, i) => (
						<div key={p.id || i} className="w-full shrink-0 snap-center">
							<MissionProgressRing
								label={p.title.split(" ")[0] ?? "ミッション"}
								value={p.currentCount ?? 0}
								max={p.goalCount ?? 1}
							/>
						</div>
					))
				) : (
					<div className="w-full shrink-0 snap-center">
						<MissionProgressRing label="ミッションなし" value={0} max={1} />
					</div>
				)}
			</div>

			{/* ドットインジケーター */}
			<SlideDots
				count={progresses.length}
				activeIndex={active}
				onDotClick={(i) => goToIndex(i)}
			/>

			<style jsx>{`
				.no-scrollbar::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</div>
	);
}
