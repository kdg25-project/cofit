import { Center, Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function BadgeModel({ url }: { url: string }) {
	const groupRef = useRef<THREE.Group>(null);
	const { scene } = useGLTF(url);

	const clonedScene = useMemo(() => scene.clone(), [scene]);

	useFrame((state, delta) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += delta * 0.6;
		}
	});

	return (
		<Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
			<group ref={groupRef}>
				<Center precise>
					<primitive object={clonedScene} scale={10} />
				</Center>
			</group>
		</Float>
	);
}
