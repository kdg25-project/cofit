"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useExerciseCounter } from "@/hooks/useExerciseCounter";
import { client } from "@/lib/hono-client";

function pad2(n: number) {
	return String(n).padStart(2, "0");
}

function formatHMS(totalSec: number) {
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function useLandscape() {
	const [isLandscape, setIsLandscape] = useState(true);

	useEffect(() => {
		const mql = window.matchMedia("(orientation: landscape)");
		const check = () => setIsLandscape(mql.matches);
		check();
		mql.addEventListener("change", check);
		return () => mql.removeEventListener("change", check);
	}, []);

	return isLandscape;
}

export default function RecordPage() {
	const isLandscape = useLandscape();
	const searchParams = useSearchParams();
	const router = useRouter();
	const mode =
		(searchParams.get("mode") as "squat" | "situp" | "pushup") || "squat";

	const exerciseName = useMemo(() => {
		switch (mode) {
			case "squat":
				return "スクワット";
			case "situp":
				return "腹筋";
			case "pushup":
				return "腕立て伏せ";
			default:
				return "エクササイズ";
		}
	}, [mode]);

	const [sec, setSec] = useState(0);
	const startTime = useRef<Date | null>(null);

	const { count, state, start, stop, isSupported, isPermissionGranted } =
		useExerciseCounter({
			mode: mode === "pushup" ? "squat" : mode, // pushup is currently using squat logic as approximation or filler
		});

	const running = state === "MEASURING";

	useEffect(() => {
		if (!running || !isLandscape) return;
		const id = window.setInterval(() => setSec((v) => v + 1), 1000);
		return () => window.clearInterval(id);
	}, [running, isLandscape]);

	const timeText = useMemo(() => formatHMS(sec), [sec]);

	const onStart = async () => {
		const ok = await start();
		if (ok) {
			startTime.current = new Date();
			setSec(0);
		}
	};

	// アクセス時（かつ横向き時）に自動スタートを試行
	useEffect(() => {
		if (isLandscape && state === "IDLE") {
			const timer = setTimeout(() => {
				onStart();
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [isLandscape, state]);

	const onEnd = async () => {
		stop();
		const end = new Date();
		if (count > 0 && startTime.current) {
			try {
				await client.api.user.activities.$post({
					json: {
						activity: mode,
						count: count,
						startTime: startTime.current.toISOString(),
						endTime: end.toISOString(),
					},
				});
			} catch (e) {
				console.error("Failed to save activity", e);
			}
		}
		alert(`終了！経過時間: ${timeText}、回数: ${count}回`);
		router.push("/");
	};

	const Circle = (
		<div className="relative h-[clamp(190px,62.2vw,250px)] w-[clamp(190px,62.2vw,250px)] rounded-full bg-base shadow-[inset_0_-5px_6px_rgba(0,0,0,0.25)] rotate-90">
			<div className="absolute inset-0 z-10 grid place-items-center">
				<div className="flex items-end justify-center gap-2 -rotate-90 origin-center">
					<div className="text-[100px] font-semibold leading-none text-primary tabular-nums">
						{count}
					</div>
					<div className="text-[30px] font-semibold text-primary">回</div>
				</div>
			</div>
		</div>
	);

	if (!isLandscape) {
		return (
			<main className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary p-10 text-center text-white">
				<div className="flex flex-col items-center gap-8">
					<div className="relative h-28 w-16 rounded-xl border-4 border-white/40 shadow-xl">
						<div className="absolute inset-x-2 top-2 h-1 rounded-full bg-white/20" />
						<div className="absolute inset-x-4 bottom-2 h-1 rounded-full bg-white/20" />
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="h-10 w-10 animate-[spin_2.5s_ease-in-out_infinite] text-white">
								<svg
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
									className="h-full w-full"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
									/>
								</svg>
							</div>
						</div>
					</div>
					<div className="space-y-3">
						<h1 className="text-3xl font-bold tracking-tight">
							画面を横にしてください
						</h1>
						<p className="mx-auto max-w-70 text-center text-base font-medium opacity-90">
							エクササイズを始めるには、デバイスを横向きにする必要があります。
						</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="w-dvw h-dvh overflow-hidden">
			<div className="relative w-full h-full bg-[linear-gradient(0deg,#BBE5DB_6%,rgba(16,185,129,0.9)_100%)]">
				<div className="pt-[env(safe-area-inset-top)] h-full">
					<div className="mx-auto h-full w-full max-w-[900px] px-20 pb-[env(safe-area-inset-bottom)]">
						<div className="h-full grid grid-cols-[1fr_250px] items-center gap-3">
							<div className="flex flex-col justify-center gap-3 items-start">
								<div className="text-lg text-text text-left">
									ミッションをクリアしよう！
								</div>

								<div className="flex flex-col gap-4 items-start">
									<div className="mt-6 text-text text-lg text-left">
										経過時間
									</div>

									<div className="text-text font-semibold tabular-nums text-[clamp(52px,8vw,92px)] text-left">
										{timeText}
									</div>

									{!running ? (
										<button
											type="button"
											onClick={onStart}
											className="rounded-full bg-primary h-[45px] w-[223px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] active:scale-[0.99] border-2 border-white"
										>
											<span className="text-white text-base font-medium">
												スタート
											</span>
										</button>
									) : (
										<button
											type="button"
											onClick={onEnd}
											className="rounded-full bg-text h-[45px] w-[223px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] active:scale-[0.99]"
										>
											<span className="text-text2 text-base font-medium">
												終了する
											</span>
										</button>
									)}
								</div>
							</div>

							<div className="flex flex-col justify-center gap-6 items-center">
								<div className="text-sub font-semibold text-[30px]">
									{exerciseName}
								</div>

								<div>{Circle}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
