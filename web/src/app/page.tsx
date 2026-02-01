"use client";

import { authClient } from "@/lib/auth-client";
import { ActivityCalendar } from "@/components/home/ActivityCalendar";
import { MissionSlider } from "@/components/home/MissionSlider";



export default function Home() {
  const session = authClient.useSession();
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const todayLabel = `${month}/${day}`;

  return (
    <main className="min-h-dvh bg-[var(--base-color)]">
		<header className="sticky top-0 z-50 bg-[var(--primary-color)] text-[var(--text2-color)]">
			<div className="pt-[env(safe-area-inset-top)]">
				<div className="h-[165px] flex flex-col">
					<div className="flex-1" />
					<div className="px-5 flex items-center justify-between">
						
						<div className="flex items-center gap-4">
						<div className="h-[50px] w-[50px] rounded-full bg-[var(--text-color)] flex items-center justify-center">
						</div>

						<div className="leading-tight text-left">
							<p className="text-base">ようこそ</p>
							<p className="text-lg font-semibold">飯田 陸</p>
						</div>
					</div>

					<button className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
							🏆
					</button>
					</div>
				<div className="h-[30px]" />
				</div>
			</div>
		</header>


		<div className="px-5 pb-28 pt-6">
			<div className="mb-4">
				<div className="text-xl text-[var(--text-color)]">ミッション</div>
			</div>

			<div className="relative rounded-3xl bg-transparent">
				<div className="absolute top-0 left-0 text-[18px] font-medium text-[var(--text-color)]">
					{month}/{day}
				</div>
				
				<MissionSlider
					today={today}
					streak={100}
					exerciseLabel="スクワット"
					autoMs={3000}
				/>

				<div className="absolute right-0 top-0">
					<div className="rounded-full bg-form px-3 py-2 shadow-sm flex items-center gap-1">
						<span>🔥</span>
						<span className="text-base">100</span>
					</div>
				</div>
			</div>

			<div className="mt-8">
				<ActivityCalendar
					year={2026}
					month={1}
					activeDays={[29, 30, 31, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
					inactiveDays={[28, 4, 5, 16, 17]}
				/>
       		</div>
      	</div>
    </main>
  );
}
