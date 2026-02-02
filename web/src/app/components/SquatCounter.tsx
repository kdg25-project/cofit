"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccelerometer } from "@/hooks/useAccelerometer";

type State = "IDLE" | "MEASURING" | "COOLDOWN";
type SquatPhase = "STANDING" | "DESCENDING" | "BOTTOM" | "ASCENDING";

export const SquatCounter: React.FC = () => {
	const { data, error, isSupported, requestPermission } = useAccelerometer();
	const [count, setCount] = useState(0);
	const [state, setState] = useState<State>("IDLE");
	const [phase, setPhase] = useState<SquatPhase>("STANDING");

	const lastFilteredNorm = useRef<number>(0);
	const lastTimestamp = useRef<number>(0);

	const peakBuffer = useRef<number[]>([]);
	const [peakBufferView, setPeakBufferView] = useState<number[]>([]);
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
	const MIN_SQUAT_TIME = 400;
	const MAX_SQUAT_TIME = 4000;
	const MIN_DEPTH_M = 0.15;

	const resetStats = () => {
		currentThreshold.current = 3.0;
		peakBuffer.current = [];
		requestAnimationFrame(() => {
			setPeakBufferView([]);
		});
		console.log("Stats reset due to inactivity");
	};

	useEffect(() => {
		if (state !== "MEASURING" || !data) {
			if (data) lastTimestamp.current = data.timestamp;
			return;
		}

		const now = data.timestamp || Date.now();
		const dt = (now - lastTimestamp.current) / 1000;
		lastTimestamp.current = now;

		if (dt <= 0 || dt > 0.5) {
			return;
		}

		const rawNorm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
		const gravityCompensated = rawNorm - 9.8;
		const filteredNorm =
			lastFilteredNorm.current * (1 - LPF_ALPHA) +
			gravityCompensated * LPF_ALPHA;
		lastFilteredNorm.current = filteredNorm;

		velocityZ.current += filteredNorm * dt;
		velocityZ.current *= 0.95;

		positionZ.current += velocityZ.current * dt;

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
			if (filteredNorm < currentRepMin.current) {
				currentRepMin.current = filteredNorm;
			}

			if (depthM > maxDepthObserved.current) {
				maxDepthObserved.current = depthM;
			}

			if (filteredNorm > 0) {
				requestAnimationFrame(() => setPhase("BOTTOM"));
			}
		} else if (phase === "BOTTOM") {
			if (depthM > maxDepthObserved.current) {
				maxDepthObserved.current = depthM;
			}
			if (filteredNorm > 0.5) {
				requestAnimationFrame(() => setPhase("ASCENDING"));
			}
		} else if (phase === "ASCENDING") {
			if (filteredNorm > currentRepMax.current) {
				currentRepMax.current = filteredNorm;
			}

			const isDone = filteredNorm < 0.5 && filteredNorm > -0.5;

			if (isDone) {
				const duration = Date.now() - repStartTime.current;

				const absMin = Math.abs(currentRepMin.current);
				const intensity = Math.max(absMin, currentRepMax.current);

				const isValidIntensity = intensity > Th_a * 0.3;
				const isValidDuration =
					duration >= MIN_SQUAT_TIME && duration <= MAX_SQUAT_TIME;

				const isDeepEnough = maxDepthObserved.current > MIN_DEPTH_M;

				if (isValidDuration && isValidIntensity && isDeepEnough) {
					if ("vibrate" in navigator) navigator.vibrate(100);

					const newBuffer = [...peakBuffer.current, intensity];
					if (newBuffer.length > BUFFER_SIZE) newBuffer.shift();
					peakBuffer.current = newBuffer;

					const avgPeak =
						newBuffer.reduce((a, b) => a + b, 0) / newBuffer.length;
					const newThreshold = avgPeak * K_SENSITIVITY;

					currentThreshold.current = newThreshold;
					requestAnimationFrame(() => {
						setPeakBufferView([...newBuffer]);
					});
				} else {
					console.log("Rep ignored:", {
						isValidDuration,
						isValidIntensity,
						isDeepEnough,
						depth: maxDepthObserved.current,
					});
				}

				requestAnimationFrame(() => setPhase("STANDING"));
				lastActivityTime.current = Date.now();
			}
		}
	}, [data, state, phase]);

	const handleStart = async () => {
		const granted = await requestPermission();
		if (granted) {
			if (data) lastTimestamp.current = data.timestamp;
			setState("MEASURING");
			setCount(0);
			setPhase("STANDING");
			resetStats();
			lastActivityTime.current = Date.now();
		}
	};

	const handleStop = () => {
		setState("IDLE");
	};

	if (!isSupported) {
		return (
			<div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 italic">
				加速度センサーはこのブラウザではサポートされていません。
			</div>
		);
	}

	return (
		<div>
			<p>Count: {count}</p>
			<p>State: {state}</p>
			<p>Phase: {phase}</p>
			<p>Data: {JSON.stringify(data)}</p>
			<p>Error: {error}</p>
			<button onClick={handleStart}>Start</button>
			<button onClick={handleStop}>Stop</button>
		</div>
	);
};
