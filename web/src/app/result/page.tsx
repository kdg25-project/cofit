"use client";
import LoopIcon from "@mui/icons-material/Loop";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { ResultProgressRing } from "@/components/result/ResultProgressRing";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ResultPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const toNumber = (value: string | null, fallback = 0) => {
		const parsed = value ? Number(value) : NaN;
		return Number.isFinite(parsed) ? parsed : fallback;
	};

	const value = toNumber(searchParams.get("value"), 0);
	const total = toNumber(searchParams.get("total"), 100);
	const remaining = Math.max(total - value, 0);
	const isClear = value >= total;
	const exerciseName = searchParams.get("exercise") ?? "スクワット";
	const timeText = searchParams.get("time") ?? "00:16:00";
	const countText = `${value}回`;
	const resultId = searchParams.get("id");

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

					<section className="mt-10 text-center">
						<div className="text-[24px] font-semibold text-sub">
							{exerciseName}
							<span className="ml-2 text-lg font text-text">の結果</span>
						</div>
					</section>

					<section className="mt-5">
						<div className="rounded-2xl border border-secondary bg-base shadow-sm px-5 py-4">
							<div className="grid grid-cols-[auto_1fr] items-center gap-x-10 gap-y-4">
								<div className="flex items-center gap-3">
									<TimerRoundedIcon
										sx={{
											fontSize: 40,
											color: "#10B981",
										}}
									/>
									<div className="text-text text-base">計測時間</div>
								</div>
								<div className="text-text text-lg font-semibold tabular-nums text-left">
									{timeText}
								</div>

								<div className="flex items-center gap-3">
									<LoopIcon
										sx={{
											fontSize: 40,
											color: "#10B981",
										}}
									/>
									<div className="text-text text-base">回数</div>
								</div>
								<div className="text-text text-lg font-semibold text-left">
									{countText}
								</div>
							</div>
						</div>
					</section>

					<div className="mt-15">
						<PrimaryButton className="w-[322px]" onClick={() => router.push("/")}>
							ホームに戻る
						</PrimaryButton>
					</div>
					{resultId ? (
						<p className="mt-6 text-center text-xs text-text/50">
							result id: {resultId}
						</p>
					) : null}
				</div>
			</div>
		</main>
	);
}
