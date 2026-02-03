"use client";
import LoopIcon from "@mui/icons-material/Loop";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import { ResultProgressRing } from "@/components/result/ResultProgressRing";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type ResultPageProps = {
	searchParams?: {
		id?: string;
	};
};

export default function ResultPage({ searchParams }: ResultPageProps) {
	const value = 90;
	const total = 100;
	const remaining = Math.max(total - value, 0);
	const isClear = value >= total;
	const exerciseName = "スクワット";
	const timeText = "00:16:00";
	const countText = "17回";

	return (
		<main className="min-h-dvh bg-base">
			<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
				<div className="mx-auto w-full max-w-[360px] px-6 pb-10 pt-12">
					<header className="text-center space-y-3">
						<h1 className="text-xl text-text">計測終了</h1>
						<p className="text-text text-lg">
							{isClear
								? "ミッションクリア！！"
								: `クリアまであと${remaining} 回`}
						</p>
					</header>

					<section className="mt-10">
						<ResultProgressRing
							value={value}
							max={total}
							size={260}
							stroke={12}
						/>
					</section>

					<section className="mt-8 text-center">
						<div className="text-[24px] font-semibold text-sub">
							{exerciseName}
							<span className="ml-2 text-lg font text-text">の結果</span>
						</div>
					</section>

					<section className="mt-5">
						<div className="rounded-2xl border border-secondary bg-base shadow-sm px-5 py-4 space-y-4">
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
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<LoopIcon
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
						<PrimaryButton className="w-[322px]">ホームに戻る</PrimaryButton>
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
