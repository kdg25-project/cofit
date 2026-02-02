"use client";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/lib/hono-client";
import BadgeCard from "../components/badge/BadgeCard";

export default function BadgesPage() {
	const [earnedBadges, setEarnedBadges] = useState<
		{
			id: number;
			name: string;
			description: string;
			howToGet: string;
			url: string | null;
			isEarned: true;
			earnedAt: string;
		}[]
	>([]);
	const [unearnedBadges, setUnearnedBadges] = useState<
		{
			id: number;
			name: string;
			description: string;
			howToGet: string;
			url: string | null;
			isEarned: false;
		}[]
	>([]);

	useEffect(() => {
		const fetchBadges = async () => {
			const res = await client.api.badges.status.$get();
			if (res.ok) {
				const data = await res.json();
				setEarnedBadges(data.earnedBadge as typeof earnedBadges);
				setUnearnedBadges(data.unearnedBadge as typeof unearnedBadges);
			}
		};
		fetchBadges();
	}, []);

	return (
		<div className="p-4 md:p-8 bg-[#F5F5F3] min-h-screen flex justify-center">
			<div className="w-full max-w-[402px] md:max-w-6xl">
				<div className="flex items-center mb-8 md:mb-12">
					<Link href="/" className="relative left-[6.5%] md:left-0">
						<ArrowBack sx={{ width: 40, height: 40 }} />
					</Link>
					<h1 className="text-2xl md:text-4xl font-bold text-[#1D2B44] absolute left-1/2 transform -translate-x-1/2">
						バッジ一覧
					</h1>
				</div>
				<div className="flex flex-col gap-12">
					{earnedBadges.length > 0 && (
						<section>
							<div className="relative h-12 mb-6">
								<h2 className="text-xl md:text-2xl font-bold text-[#1D2B44] absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
									獲得したバッジ
								</h2>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8 justify-items-center">
								{earnedBadges.map((badge) => (
									<BadgeCard
										key={badge.id}
										name={badge.name}
										description={badge.description}
										howToGet={badge.howToGet}
										url={badge.url ?? ""}
										isEarned={true}
										whenEarned={new Date(badge.earnedAt).toLocaleDateString()}
									/>
								))}
							</div>
						</section>
					)}

					{unearnedBadges.length > 0 && (
						<section>
							<div className="relative h-12 mb-6">
								<h2 className="text-xl md:text-2xl font-bold text-[#1D2B44] absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
									未獲得のバッジ
								</h2>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8 justify-items-center">
								{unearnedBadges.map((badge) => (
									<BadgeCard
										key={badge.id}
										name={badge.name}
										description={badge.description}
										howToGet={badge.howToGet}
										url={badge.url ?? ""}
										isEarned={false}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
