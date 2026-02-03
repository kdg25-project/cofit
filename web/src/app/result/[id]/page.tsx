"use client";
import LoopIcon from "@mui/icons-material/Loop";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ResultProgressRing } from "@/components/result/ResultProgressRing";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { client } from "@/lib/hono-client";

interface Activity {
	id: number;
	activity: string;
	count: number;
	startTime: string;
	endTime: string;
}

interface Mission {
	id: number;
	title: string;
	goalCount: number;
	type: "daily" | "weekly" | "monthly";
	mode: "squat" | "situp" | "pushup";
	currentCount: number;
	expiredAt: string;
}

function formatHMS(startStr: string, endStr: string) {
	const start = new Date(startStr);
	const end = new Date(endStr);
	const diffSec = Math.floor((end.getTime() - start.getTime()) / 1000);
	const h = Math.floor(diffSec / 3600);
	const m = Math.floor((diffSec % 3600) / 60);
	const s = diffSec % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function ResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const { id: activityId } = use(params);

	const [activity, setActivity] = useState<Activity | null>(null);
	const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				// 1. アクティビティ情報の取得
				const activityRes = await client.api.user.activities.detail[":id"].$get(
					{
						param: { id: activityId },
					},
				);
				if (!activityRes.ok) throw new Error("Activity not found");
				const activityData = await activityRes.json();
				setActivity(activityData);

				// 2. ミッション一覧の取得
				const missionsRes = await client.api.missions.$get();
				if (!missionsRes.ok) throw new Error("Failed to fetch missions");
				const missionsData = (await missionsRes.json()) as Mission[];

				// 3. ミッション選択ロジック
				// 同じモードのミッションを抽出
				const modeMissions = missionsData.filter(
					(m) => m.mode === activityData.activity,
				);

				if (modeMissions.length > 0) {
					// 未クリアのものを優先度順にソート (daily > weekly > monthly)
					const priority = { daily: 1, weekly: 2, monthly: 3 };
					const uncleared = modeMissions
						.filter((m) => m.currentCount < m.goalCount)
						.sort((a, b) => priority[a.type] - priority[b.type]);

					if (uncleared.length > 0) {
						setSelectedMission(uncleared[0]);
					} else {
						// 全てクリア済みならデイリーを表示
						const daily = modeMissions.find((m) => m.type === "daily");
						setSelectedMission(daily || modeMissions[0]);
					}
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [activityId]);

	if (loading) {
		return (
			<main className="min-h-dvh bg-base flex items-center justify-center">
				<p className="text-text">読み込み中...</p>
			</main>
		);
	}

	if (!activity) {
		return (
			<main className="min-h-dvh bg-base flex items-center justify-center gap-4 flex-col">
				<p className="text-text">データが見つかりませんでした</p>
				<PrimaryButton onClick={() => router.push("/")}>
					ホームへ戻る
				</PrimaryButton>
			</main>
		);
	}

	const exerciseName =
		activity.activity === "squat"
			? "スクワット"
			: activity.activity === "situp"
				? "腹筋"
				: "腕立て伏せ";

	const value = selectedMission ? selectedMission.currentCount : activity.count;
	const total = selectedMission ? selectedMission.goalCount : 100;
	const remaining = Math.max(total - value, 0);
	const isClear = value >= total;
	const timeText = formatHMS(activity.startTime, activity.endTime);

	return (
		<main className="min-h-dvh bg-base">
			<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
				<div className="mx-auto w-full max-w-[360px] px-6 pb-10 pt-12">
					<header className="text-center space-y-3">
						<h1 className="text-xl text-text">計測終了</h1>
						<p className="text-text text-lg">
							{isClear
								? "ミッションクリア！！"
								: `クリアまであと${remaining}回`}
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
									{activity.count}回
								</div>
							</div>
						</div>
					</section>

					<div className="mt-15">
						<PrimaryButton
							className="w-[322px]"
							onClick={() => router.push("/")}
						>
							ホームに戻る
						</PrimaryButton>
					</div>
					<p className="mt-6 text-center text-xs text-text/50">
						result id: {activityId}
						{selectedMission && ` / mission: ${selectedMission.title}`}
					</p>
				</div>
			</div>
		</main>
	);
}
