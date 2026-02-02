"use client";

import { EmojiEvents } from "@mui/icons-material";
import Image from "next/image";
import { useState } from "react";
import { ActivityCalendar } from "@/components/home/ActivityCalendar";
import { MissionSlider } from "@/components/home/MissionSlider";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const session = authClient.useSession();

	const today = new Date();
	const month = today.getMonth() + 1;
	const day = today.getDate();

	const [ym, setYm] = useState(() => ({
		year: today.getFullYear(),
		month: today.getMonth() + 1,
	}));

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

	const activeDays = [
		3, 18, 19, 20, 23, 26, 27, 29, 30, 31, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
	];
	const inactiveDays = [28, 1, 2, 4, 5, 16, 17, 21, 22, 24, 25];

	return (
		<main className="min-h-dvh bg-base">
			<header className="sticky top-0 z-50 bg-primary text-text2">
				<div className="pt-[env(safe-area-inset-top)]">
					<div className="h-[165px] flex flex-col">
						<div className="flex-1" />
						<div className="px-5 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="h-[50px] w-[50px] rounded-full bg-text flex items-center justify-center">
									{session.data?.user?.image ? (
										<Image
											src={session.data.user.image}
											alt=""
											className="h-full w-full rounded-full"
										/>
									) : (
										<div className="h-full w-full rounded-full bg-text2" />
									)}
								</div>
								<div className="leading-tight text-left">
									<p className="text-base">ようこそ</p>
									<p className="text-lg font-semibold">
										{session.data?.user.displayName}
									</p>
								</div>
							</div>

							<button className="h-14 w-14 rounded-full bg-text2 text-black flex items-center justify-center shadow-sm">
								<EmojiEvents />
							</button>
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
								streak={100}
								exerciseLabel="スクワット"
								autoMs={3000}
							/>

							<div className="absolute right-0 top-0">
								<div className="rounded-full bg-base px-3 py-2 shadow-sm flex items-center gap-1">
									<span>🔥</span>
									<span className="text-text">100</span>
								</div>
							</div>
						</div>
					</section>

					{/* カレンダー */}
					<section>
						<ActivityCalendar
							year={ym.year}
							month={ym.month}
							today={today}
							activeDays={activeDays}
							inactiveDays={inactiveDays}
							onPrev={goPrev}
							onNext={goNext}
						/>
					</section>
				</div>
			</div>
		</main>
	);
}
