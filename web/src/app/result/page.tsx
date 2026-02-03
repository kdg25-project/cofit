import Link from "next/link";

type ResultPageProps = {
	searchParams?: {
		id?: string;
	};
};

function IconTimer({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M9 3h6M12 7a8 8 0 1 0 8 8"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 11v4l3 2"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function IconRepeat({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M4 12a8 8 0 0 1 13.66-5.66L20 4"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M20 4v6h-6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M20 12a8 8 0 0 1-13.66 5.66L4 20"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M4 20v-6h6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

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
						<h1 className="text-[22px] font-semibold text-text">計測終了</h1>
						<p className="text-text text-base">クリアまであと{remaining}回</p>
					</header>

					<section className="mt-10 flex justify-center">
						<div className="relative h-[240px] w-[240px]">
							<svg
								width={size}
								height={size}
								viewBox={`0 0 ${size} ${size}`}
								className="-rotate-90 drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
								aria-hidden="true"
							>
								<defs>
									<linearGradient
										id="resultProgress"
										x1="0%"
										y1="0%"
										x2="100%"
										y2="100%"
									>
										<stop offset="0%" stopColor="#10B981" />
										<stop offset="100%" stopColor="#00605E" />
									</linearGradient>
								</defs>
								<circle
									cx={size / 2}
									cy={size / 2}
									r={radius}
									stroke="#D9D9D9"
									strokeWidth={stroke}
									fill="none"
								/>
								<circle
									cx={size / 2}
									cy={size / 2}
									r={radius}
									stroke="url(#resultProgress)"
									strokeWidth={stroke}
									fill="none"
									strokeDasharray={`${dash} ${circumference - dash}`}
									strokeLinecap="round"
								/>
							</svg>

							<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
								<div className="text-[52px] font-semibold text-text leading-none">
									{value}回
								</div>
								<div className="text-base text-text/70">/ {total}</div>
							</div>
						</div>
					</section>

					<section className="mt-8 text-center">
						<div className="text-[22px] font-semibold text-sub">
							{exerciseName}
							<span className="ml-2 text-base font-medium text-text">
								の結果
							</span>
						</div>
					</section>

					<section className="mt-5">
						<div className="rounded-2xl border border-primary/70 bg-[#FFF8F1] shadow-[0_10px_24px_rgba(16,185,129,0.12)] px-5 py-4 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<IconTimer className="h-8 w-8 text-primary" />
									<div className="text-text text-sm font-medium">計測時間</div>
								</div>
								<div className="text-text text-lg font-semibold tabular-nums">
									{timeText}
								</div>
							</div>
							<div className="h-px w-full bg-primary/20" />
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<IconRepeat className="h-8 w-8 text-primary" />
									<div className="text-text text-sm font-medium">回数</div>
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
