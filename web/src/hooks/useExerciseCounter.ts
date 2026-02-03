"use client";

import { useEffect, useRef, useState } from "react";
import { useAccelerometer } from "@/hooks/useAccelerometer";

type State = "IDLE" | "MEASURING" | "COOLDOWN";
type Phase = "STANDING" | "DESCENDING" | "BOTTOM" | "ASCENDING";

export interface ExerciseCounterOptions {
	mode: "squat" | "situp" | "pushup";
	onCount?: (count: number) => void;
}

export const useExerciseCounter = (options: ExerciseCounterOptions) => {
	const { data, error, isSupported, isPermissionGranted, requestPermission } =
		useAccelerometer();
	const [count, setCount] = useState(0);
	const [state, setState] = useState<State>("IDLE");
	const [phase, setPhase] = useState<Phase>("STANDING");

	const lastFilteredNorm = useRef<number>(0);
	const lastTimestamp = useRef<number>(0);

	const peakBuffer = useRef<number[]>([]);
	const currentThreshold = useRef<number>(3.0);
	const lastActivityTime = useRef<number>(0);

	const velocityZ = useRef<number>(0);
	const positionZ = useRef<number>(0);
	const maxDepthObserved = useRef<number>(0);

	const repStartTime = useRef<number>(0);
	const currentRepMin = useRef<number>(0);
	const currentRepMax = useRef<number>(0);

	const BUFFER_SIZE = 5;
	const K_SENSITIVITY = 0.65;
	const LPF_ALPHA = 0.2;
	const AUTO_RESET_TIMEOUT = 30000;
	const MIN_TIME = 400;
	const MAX_TIME = 4000;
	const MIN_DEPTH_M = 0.15;

	const resetStats = () => {
		currentThreshold.current = 3.0;
		peakBuffer.current = [];
	};

	useEffect(() => {
		if (state !== "MEASURING" || !data) {
			if (data) lastTimestamp.current = data.timestamp;
			return;
		}

		const now = data.timestamp || Date.now();
		const dt = (now - lastTimestamp.current) / 1000;
		lastTimestamp.current = now;

		if (dt <= 0 || dt > 0.5) return;

		const rawNorm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
		const gravityCompensated = rawNorm - 9.8;

		const filteredNorm =
			lastFilteredNorm.current * (1 - LPF_ALPHA) +
			gravityCompensated * LPF_ALPHA;
		lastFilteredNorm.current = filteredNorm;

		velocityZ.current += filteredNorm * dt;
		velocityZ.current *= 0.95;
		positionZ.current += velocityZ.current * dt;

		const depthM = -positionZ.current;

		if (
			phase === "STANDING" &&
			Date.now() - lastActivityTime.current > AUTO_RESET_TIMEOUT
		) {
			resetStats();
			lastActivityTime.current = Date.now();
		}

		const Th_a = currentThreshold.current;

		if (phase === "STANDING") {
			if (filteredNorm < -(Th_a * 0.5)) {
				requestAnimationFrame(() => setPhase("DESCENDING"));
				repStartTime.current = Date.now();
				currentRepMin.current = filteredNorm;
				currentRepMax.current = 0;
				velocityZ.current = 0;
				positionZ.current = 0;
				maxDepthObserved.current = 0;
				lastActivityTime.current = Date.now();
			}
		} else if (phase === "DESCENDING") {
			if (filteredNorm < currentRepMin.current)
				currentRepMin.current = filteredNorm;
			if (depthM > maxDepthObserved.current) maxDepthObserved.current = depthM;
			if (filteredNorm > 0) requestAnimationFrame(() => setPhase("BOTTOM"));
		} else if (phase === "BOTTOM") {
			if (depthM > maxDepthObserved.current) maxDepthObserved.current = depthM;
			if (filteredNorm > 0.5)
				requestAnimationFrame(() => setPhase("ASCENDING"));
		} else if (phase === "ASCENDING") {
			if (filteredNorm > currentRepMax.current)
				currentRepMax.current = filteredNorm;
			if (filteredNorm < 0.5 && filteredNorm > -0.5) {
				const duration = Date.now() - repStartTime.current;
				const intensity = Math.max(
					Math.abs(currentRepMin.current),
					currentRepMax.current,
				);
				const isValidIntensity = intensity > Th_a * 0.3;
				const isValidDuration = duration >= MIN_TIME && duration <= MAX_TIME;
				const isDeepEnough = maxDepthObserved.current > MIN_DEPTH_M;

				if (isValidDuration && isValidIntensity && isDeepEnough) {
					requestAnimationFrame(() => {
						setCount((c) => {
							const next = c + 1;
							options.onCount?.(next);
							return next;
						});
					});
					if ("vibrate" in navigator) navigator.vibrate(100);

					const newBuffer = [...peakBuffer.current, intensity];
					if (newBuffer.length > BUFFER_SIZE) newBuffer.shift();
					peakBuffer.current = newBuffer;
					currentThreshold.current =
						(newBuffer.reduce((a, b) => a + b, 0) / newBuffer.length) *
						K_SENSITIVITY;
				}
				requestAnimationFrame(() => setPhase("STANDING"));
				lastActivityTime.current = Date.now();
			}
		}
	}, [data, state, phase, options]);

	const start = async () => {
		const granted = await requestPermission();
		if (granted) {
			if (data) lastTimestamp.current = data.timestamp;
			setCount(0);
			setPhase("STANDING");
			resetStats();
			lastActivityTime.current = Date.now();
			setState("MEASURING");
			return true;
		}
		return false;
	};

	const stop = () => {
		setState("IDLE");
	};

	return {
		count,
		state,
		phase,
		isSupported,
		isPermissionGranted,
		start,
		stop,
		error,
	};
};
