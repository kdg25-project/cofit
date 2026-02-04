"use client";
import { QuestionMark } from "@mui/icons-material";
import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import BadgeModal from "./BadgeModal";
import { BadgeModel } from "./Model";

type BadgeCardProps = {
	name: string;
	description: string;
	howToGet: string;
	url: string;
} & ({ isEarned: true; whenEarned: string } | { isEarned: false });

export default function BadgeCard(props: BadgeCardProps) {
	const { name, description, howToGet, url, isEarned } = props;
	const [isOpen, setIsOpen] = useState(false);

	const infoText = isEarned
		? new Date(props.whenEarned).toLocaleDateString()
		: howToGet;

	return (
		<>
			<div
				onClick={() => setIsOpen(true)}
				className="bg-white rounded-3xl md:rounded-4xl p-3 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-neutral-50 flex flex-col items-center gap-3 md:gap-4 cursor-pointer w-full max-w-45 md:max-w-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group"
			>
				{/* Model Container with Background Effect */}
				<div className="w-full aspect-square rounded-2xl md:rounded-3xl  relative bg-[#F8F9FA]">
					{/* Background Glow Effect */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#E2E8F0_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

					<Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
						<ambientLight intensity={1.5} />
						<spotLight
							position={[10, 10, 10]}
							angle={0.15}
							penumbra={1}
							intensity={2}
						/>
						<pointLight
							position={[-10, -10, -10]}
							intensity={1}
							color="#4F46E5"
						/>
						<directionalLight position={[0, 5, 5]} intensity={1.5} />
						<Environment preset="city" />
						{isEarned ? (
							<BadgeModel url={url} />
						) : (
							<mesh>
								<boxGeometry args={[0, 0, 0]} />
								<meshStandardMaterial transparent opacity={0} />
							</mesh>
						)}
						<ContactShadows
							resolution={512}
							scale={10}
							blur={2}
							opacity={0.2}
							far={10}
							color="#000000"
						/>
					</Canvas>
					{!isEarned && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<QuestionMark
								sx={{ fontSize: { xs: 60, md: 80 }, color: "#CBD5E1" }}
							/>
						</div>
					)}
				</div>

				<div className="text-center flex flex-col gap-0.5 md:gap-1 w-full px-1">
					<h2 className="text-[#1D2B44] text-sm md:text-lg font-extrabold tracking-tight group-hover:text-black transition-colors truncate px-1">
						{name}
					</h2>
					<p className="text-[#9CA3AF] text-[8px] md:text-[10px] font-semibold tracking-wide uppercase truncate leading-tight">
						{infoText}
					</p>
				</div>
			</div>

			{isOpen && <BadgeModal {...props} onClose={() => setIsOpen(false)} />}
		</>
	);
}
