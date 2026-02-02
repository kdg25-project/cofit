import BadgeCard from "../components/badge/BadgeCard";

export default function BadgesPage() {
	return (
		<div className="p-4 md:p-8 bg-[#F5F5F3] min-h-screen flex justify-center">
			<div className="w-full max-w-[402px] md:max-w-6xl">
				<h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-[#1D2B44] text-center">
					Badges
				</h1>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8 justify-items-center">
					<BadgeCard
						name="GOLD COIN"
						description="Gold coin badge"
						howToGet="Get 1000 items"
						url="https://img-cofit.kdgn.tech/badge/models/bag_rank_gold.glb"
						isEarned={true}
						whenEarned="2026/01/31"
					/>
					<BadgeCard
						name="SILVER COIN"
						description="Silver coin badge"
						howToGet="Squat 100 times"
						url="https://img-cofit.kdgn.tech/badge/models/bag_rank_silver.glb"
						isEarned={false}
					/>
				</div>
			</div>
		</div>
	);
}
