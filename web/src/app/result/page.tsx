"use client";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";

type ResultPageProps = {
	searchParams?: {
		id?: string;
	};
};

export default function ResultPage({ searchParams }: ResultPageProps) {
	const value = 90;
	const total = 100;
	const remaining = Math.max(total - value, 0);
	const exerciseName = "スクワット";
	const timeText = "00:16:00";
	const countText = "17回";

	const size = 240;
	const stroke = 16;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = Math.min(Math.max(value / total, 0), 1);
	const dash = circumference * progress;

	return (
		<main className="min-h-dvh bg-base">
			<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
				<div className="mx-auto w-full max-w-[360px] px-6 pb-10 pt-12">
					<header className="text-center space-y-3">
						<h1 className="text-xl text-text">計測終了</h1>
						<p className="text-text text-lg">クリアまであと{remaining}回</p>
					</header>

					<section className="mt-10 flex justify-center">
						<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
							<div className="text-[52px] font-semibold text-text leading-none">
								{value}回
							</div>
							<div className="text-base text-text/70">/ {total}</div>
						</div>
					</section>

					<section className="mt-8 text-center">
						<div className="text-[24px] font-semibold text-sub">
							{exerciseName}
							<span className="ml-2 text-lg font text-text">の結果</span>
						</div>
					</section>

					<section className="mt-5">
						<div className="rounded-2xl border border-secondary bg-base shadow-[0_10px_24px_rgba(16,185,129,0.12)] px-5 py-4 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<TimerRoundedIcon
										sx={{
											fontSize: 40,
											color: "#10B981",
										}}
									/>
									<div className="text-text text-base">計測時間</div>
								</div>
								<div className="text-text text-lg font-semibold tabular-nums">
									{timeText}
								</div>
							</div>
							<div className="h-px w-full bg-primary/20" />
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<CircularProgress
										sx={{
											fontSize: 40,
											color: "#10B981",
										}}
									/>
									<div className="text-text text-base">回数</div>
								</div>
								<div className="text-text text-lg font-semibold">
									{countText}
								</div>
							</div>
						</div>
					</section>

					<div className="mt-10">
						<Link
							href="/"
							className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-text2 text-base font-semibold shadow-[0_10px_24px_rgba(16,185,129,0.28)] active:scale-[0.99]"
						>
							ホームに戻る
						</Link>
					</div>

					{searchParams?.id ? (
						<p className="mt-6 text-center text-xs text-text/50">
							result id: {searchParams.id}
						</p>
					) : null}
				</div>
			</div>
		</main>
	);
}
