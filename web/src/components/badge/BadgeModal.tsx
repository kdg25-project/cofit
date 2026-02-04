"use client";
import { Close, QuestionMark } from "@mui/icons-material";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BadgeModel } from "./Model";

interface BadgeModalProps {
	name: string;
	description: string;
	howToGet: string;
	url: string;
	isEarned: boolean;
	whenEarned?: string;
	onClose: () => void;
}

export default function BadgeModal({
	name,
	description,
	howToGet,
	url,
	isEarned,
	whenEarned,
	onClose,
}: BadgeModalProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal Content */}
			<div className="relative bg-white w-full max-w-lg max-h-[90vh] md:max-h-[85vh] rounded-4xl md:rounded-[40px]  shadow-2xl flex flex-col">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-neutral-100/80 hover:bg-neutral-200 backdrop-blur-sm rounded-full transition-colors text-neutral-600 shadow-sm"
				>
					<Close sx={{ fontSize: { xs: 20, md: 24 } }} />
				</button>

				<div className="overflow-y-auto custom-scrollbar">
					{/* 3D Model Area */}
					<div className="w-full h-64 md:h-96 bg-[#F8F9FA] relative">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#E2E8F0_0%,transparent_70%)] opacity-60" />

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
							<OrbitControls
								makeDefault
								enableDamping
								minPolarAngle={0}
								maxPolarAngle={Math.PI}
							/>
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
									sx={{
										fontSize: { xs: 100, md: 140 },
										color: "#CBD5E1",
										opacity: 0.5,
									}}
								/>
							</div>
						)}
					</div>

					{/* Details Area */}
					<div className="p-6 md:p-10 flex flex-col gap-5 md:gap-6">
						<div className="flex flex-col gap-2">
							<div className="flex items-center flex-wrap gap-2 md:gap-3">
								<h2 className="text-xl md:text-3xl font-black text-[#1D2B44] tracking-tight">
									{name}
								</h2>
								{isEarned && (
									<span className="px-3 py-0.5 md:py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full uppercase tracking-wider">
										Earned
									</span>
								)}
							</div>
							<p className="text-neutral-500 text-xs md:text-base leading-relaxed font-medium">
								{description}
							</p>
						</div>

						<div className="h-px bg-neutral-100 w-full" />

						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-1">
								<span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
									{isEarned ? "Acquired Date" : "How to acquire"}
								</span>
								<p className="text-[#1D2B44] font-extrabold text-sm md:text-lg">
									{isEarned
										? whenEarned
											? new Date(whenEarned).toLocaleDateString()
											: "Unknown"
										: howToGet}
								</p>
							</div>

							<button
								onClick={onClose}
								className="mt-2 md:mt-4 w-full py-3 md:py-4 bg-[#1D2B44] text-white font-bold rounded-xl md:rounded-2xl hover:bg-black transition-all duration-300 shadow-lg shadow-[#1D2B44]/20 active:scale-[0.98]"
							>
								了解
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
