"use client";

import { EmojiEvents } from "@mui/icons-material";
import { InferResponseType } from "hono/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityCalendar } from "@/components/home/ActivityCalendar";
import { MissionSlider } from "@/components/home/MissionSlider";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/hono-client";

type UserMeResponse = InferResponseType<typeof client.api.user.me.$get>;

export default function Home() {
	const session = authClient.useSession();
	const [activeDays, setActiveDays] = useState<number[]>([]);
	const [userData, setUserData] = useState<Extract<
		UserMeResponse,
		{ streak: number }
	> | null>(null);

	const today = new Date();

	const [ym, setYm] = useState(() => ({
		year: today.getFullYear(),
		month: today.getMonth() + 1,
	}));

	useEffect(() => {
		(async () => {
			try {
				const [activityRes, userRes] = await Promise.all([
					client.api.user.activities[":month"].$get({
						param: {
							month: `${ym.year}-${String(ym.month).padStart(2, "0")}`,
						},
					}),
					client.api.user.me.$get(),
				]);

				if (activityRes.ok) {
					const data = await activityRes.json();
					if (Array.isArray(data)) {
						setActiveDays(data);
					}
				}

				if (userRes.ok) {
					const data = await userRes.json();
					if (data && "streak" in data) {
						setUserData(data as Extract<UserMeResponse, { streak: number }>);
					}
				}
			} catch (e) {
				console.error(e);
			}
		})();
	}, [ym]);

	const goPrev = () => {
		setYm((p) => {
			const m = p.month - 1;
			if (m < 1) return { year: p.year - 1, month: 12 };
			return { year: p.year, month: m };
		});
	};

	const goNext = () => {
		setYm((p) => {
			const m = p.month + 1;
			if (m > 12) return { year: p.year + 1, month: 1 };
			return { year: p.year, month: m };
		});
	};

	return (
		<main className="min-h-dvh bg-base">
			<header className="sticky top-0 z-50 bg-primary text-text2">
				<div className="pt-[env(safe-area-inset-top)]">
					<div className="h-24 flex flex-col">
						<div className="flex-1" />
						<div className="px-5 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<a
									href="/profile"
									className="h-[50px] w-[50px] rounded-full flex items-center justify-center overflow-hidden"
								>
									{session.data?.user?.image ? (
										<Image
											src={session.data.user.image}
											alt=""
											width={50}
											height={50}
											className="h-full w-full rounded-full object-cover"
										/>
									) : (
										<div className="h-full w-full rounded-full bg-text2" />
									)}
								</a>
								<div className="leading-tight text-left">
									<p className="text-base">ようこそ</p>
									<p className="text-lg font-semibold">
										{session.data?.user.displayName}
									</p>
								</div>
							</div>

							<Link
								className="h-14 w-14 rounded-full bg-text2 text-black flex items-center justify-center shadow-sm"
								href="/badges"
							>
								<EmojiEvents />
							</Link>
						</div>
						<div className="h-[30px]" />
					</div>
				</div>
			</header>

			<div className="w-full flex justify-center">
				<div className="w-full max-w-[361px] pt-6 pb-28 space-y-10">
					<section>
						<div className="mb-6">
							<div className="text-xl text-text">ミッション</div>
						</div>

						<div className="relative rounded-3xl bg-transparent">
							<MissionSlider
								today={today}
								streak={userData?.streak ?? 0}
								autoMs={3000}
							/>
						</div>
					</section>

					{/* カレンダー */}
					<section>
						<ActivityCalendar
							year={ym.year}
							month={ym.month}
							today={today}
							activeDays={activeDays}
							onPrev={goPrev}
							onNext={goNext}
						/>
					</section>
				</div>
			</div>
		</main>
	);
}
