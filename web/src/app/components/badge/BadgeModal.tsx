"use client";
import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BadgeModel } from "./Model";

interface BadgeCardProps {
	name: string;
	description: string;
	howToGet: string;
	url: string;
	isEarned: boolean;
}

export default function BadgeModal({
	name,
	description,
	howToGet,
	url,
	isEarned,
}: BadgeCardProps) {
	return (
		<div>
			<h1>{name}</h1>
			<p>{description}</p>
			<p>{howToGet}</p>
			<div style={{ height: "100vh", width: "100vw" }}>
				<Canvas camera={{ position: [0, 0, 5] }}>
					<ambientLight intensity={0.5} />
					<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
					<BadgeModel url={url} />
					<OrbitControls />
				</Canvas>
			</div>
			<p>{isEarned ? "Earned" : "Not Earned"}</p>
		</div>
	);
}
