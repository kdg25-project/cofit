"use client";

import { useEffect, useMemo, useState } from "react";

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
	const [isLandscape, setIsLandscape] = useState(false);

	useEffect(() => {
		const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	return isLandscape;
}

export default function RecordPage() {
	const isLandscape = useLandscape();

	const exerciseName = "スクワット";
	const [running, setRunning] = useState(true);
	const [sec, setSec] = useState(0);
	const count = sec;

	useEffect(() => {
		if (!running) return;
		const id = window.setInterval(() => setSec((v) => v + 1), 1000);
		return () => window.clearInterval(id);
	}, [running]);

	const timeText = useMemo(() => formatHMS(sec), [sec]);

	const onEnd = () => {
		setRunning(false);
		alert(`終了！経過時間: ${timeText}`);
	};

	const Circle = (
		<div
			className={[
				"relative rounded-full bg-base shadow-[0_24px_60px_rgba(0,0,0,0.20)] rotate-90",
				isLandscape ? "h-[180px] w-[180px]" : "h-[220px] w-[220px]",
			].join(" ")}
		>
			<div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
				<div className="flex items-end justify-center text-center gap-2 -rotate-90 origin-center">
					<div className="text-[54px] font-semibold leading-none text-primary tabular-nums">
						{count}
					</div>
					<div className="text-[30px] font-semibold text-primary">回</div>
				</div>
			</div>

			<div
				className={[
					"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base z-0",
					isLandscape ? "h-[38px] w-[64px]" : "h-[44px] w-[72px]",
				].join(" ")}
			/>
		</div>
	);

	return (
		<main className="w-dvw h-dvh overflow-hidden">
			<div className="relative w-full h-full bg-gradient-to-b from-[#16C79A] via-[#63D6B8] to-[#CFEFE8]">
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

									<button
										onClick={onEnd}
										className="rounded-full bg-text h-[45px] w-[223px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] active:scale-[0.99]"
									>
										<span className="text-text2 text-base font-medium">
											終了する
										</span>
									</button>
								</div>
							</div>

							<div className="flex flex-col justify-center gap-6 items-start">
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
